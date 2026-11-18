import mongoose from "mongoose";

const sellerProfileSchema = new mongoose.Schema(
  {
    shopName: { type: String, required: true, trim: true },
    region: { type: String, required: true, trim: true },
    town: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: 500 },
    verified: { type: Boolean, default: false },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, unique: true, sparse: true, trim: true },
    passwordHash: { type: String, required: true, select: false }, // hidden by default
    roles: {
      type: [String],
      enum: ["customer", "seller", "admin"],
      default: ["customer"],
    },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    sellerProfile: sellerProfileSchema, // only filled if the user becomes a seller
    addresses: [{ label: String, region: String, town: String, details: String }],

    failedLogins: { type: Number, default: 0 },
    lockUntil: { type: Date },
  },

  { timestamps: true }
);

export default mongoose.model("User", userSchema);