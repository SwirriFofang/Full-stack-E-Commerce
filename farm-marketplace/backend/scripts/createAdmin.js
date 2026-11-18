import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../src/models/User.js";

const [rawEmail, name, password] = process.argv.slice(2);
if (!rawEmail || !name || !password) {
  console.error('Usage: node scripts/createAdmin.js email "Full Name" \'Password\'');
  process.exit(1);
}

const strong =
  password.length >= 8 &&
  password.length <= 72 &&
  /[A-Z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[^A-Za-z0-9]/.test(password);
if (!strong) {
  console.error("Password needs 8 to 72 characters with a capital letter, a number and a special character.");
  process.exit(1);
}

const email = rawEmail.trim().toLowerCase();

await mongoose.connect(process.env.MONGO_URI);
const passwordHash = await bcrypt.hash(password, 12);

await User.findOneAndUpdate(
  { email },
  {
    name,
    email,
    passwordHash,
    status: "active",
    $addToSet: { roles: { $each: ["customer", "admin"] } },
  },
  { upsert: true, new: true }
);

console.log(`Admin ready: ${email}`);
await mongoose.disconnect();