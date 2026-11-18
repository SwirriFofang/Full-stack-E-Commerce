import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { HttpError } from "../middleware/error.middleware.js";
import { getPublicUser } from "./auth.service.js";

const MAX_ADDRESSES = 5;

export const listAddresses = (user) => user.addresses;

export async function addAddress(user, data) {
  if (user.addresses.length >= MAX_ADDRESSES) {
    throw new HttpError(400, `You can save up to ${MAX_ADDRESSES} addresses`);
  }
  user.addresses.push(data);
  await user.save();
  return user.addresses;
}

export async function removeAddress(user, addressId) {
  if (!user.addresses.id(addressId)) throw new HttpError(404, "Address not found");
  user.addresses.pull(addressId);
  await user.save();
  return user.addresses;
}

export async function updateProfile(user, { name, phone }) {
  user.name = name;
  user.phone = phone; // leaving the phone out removes it
  await user.save(); // a number already used by someone else gives a 409
  return getPublicUser(user);
}

export async function changePassword(userDoc, { currentPassword, newPassword }) {
  const user = await User.findById(userDoc._id).select("+passwordHash");

  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new HttpError(400, "Your current password is not correct");
  }
  if (currentPassword === newPassword) {
    throw new HttpError(400, "Choose a password different from your current one");
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
}