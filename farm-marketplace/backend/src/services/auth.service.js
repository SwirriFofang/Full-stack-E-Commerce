import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { HttpError } from "../middleware/error.middleware.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens.js";

// Only these fields ever leave the server
const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  roles: u.roles,
  sellerProfile: u.sellerProfile,
});

const buildSession = (user) => ({
  user: publicUser(user),
  accessToken: signAccessToken(user),
  refreshToken: signRefreshToken(user),
});

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;

// A real hash, compared when the email is unknown, so the response time
// does not reveal which emails have accounts
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

export async function registerUser({ name, email, phone, password, accountType, shopName, region, town }) {
  const passwordHash = await bcrypt.hash(password, 12);
  const isSeller = accountType === "seller";

  const user = await User.create({
    name,
    email,
    phone,
    passwordHash,
    roles: isSeller ? ["customer", "seller"] : ["customer"],
    sellerProfile: isSeller ? { shopName, region, town } : undefined,
  });
  return buildSession(user);
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select("+passwordHash");

  if (user?.lockUntil && user.lockUntil > new Date()) {
    throw new HttpError(429, "Too many wrong attempts. Please try again in a few minutes.");
  }

  const valid = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);

  if (!user || !valid) {
    if (user) {
      const updated = await User.findOneAndUpdate({ _id: user._id }, { $inc: { failedLogins: 1 } }, { new: true });
      if (updated.failedLogins >= MAX_FAILED_LOGINS) {
        await User.updateOne(
          { _id: user._id },
          { $set: { failedLogins: 0, lockUntil: new Date(Date.now() + LOCK_MINUTES * 60 * 1000) } }
        );
      }
    }
    throw new HttpError(401, "Wrong email or password");
  }

  if (user.status === "suspended") throw new HttpError(403, "Account suspended");

  if (user.failedLogins || user.lockUntil) {
    await User.updateOne({ _id: user._id }, { $set: { failedLogins: 0 }, $unset: { lockUntil: "" } });
  }
  return buildSession(user);
}

export async function refreshSession(refreshToken) {
  if (!refreshToken) throw new HttpError(401, "No refresh token");
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new HttpError(401, "Invalid refresh token");
  }
  const user = await User.findById(payload.sub);
  if (!user || user.status === "suspended") throw new HttpError(401, "Not allowed");
  return buildSession(user);
}

// A customer also becomes a seller (same account, two dashboards)
export async function becomeSeller(user, profile) {
  if (!user.roles.includes("seller")) user.roles.push("seller");
  user.sellerProfile = { ...(user.sellerProfile?.toObject?.() || {}), ...profile };
  await user.save();
  return buildSession(user);
}

export const getPublicUser = publicUser;