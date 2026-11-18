import mongoose from "mongoose";

export const CATEGORIES = [
  "tubers",
  "vegetables",
  "fruits",
  "grains",
  "legumes",
  "spices",
  "oils",
  "meat_fish",
  "dairy_eggs",
];

export const UNITS = ["kg", "bag", "bunch", "crate", "basket", "piece", "litre"];

const listingSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, trim: true, maxlength: 300 },
    image: { type: String }, // for example "/uploads/ab12cd.jpg"
    imageId: { type: String }, // Cloudinary's id for the picture, used to delete it
    category: { type: String, enum: CATEGORIES, required: true },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: UNITS, required: true },
    quantityAvailable: { type: Number, required: true, min: 0 },
    location: {
      region: { type: String, required: true, trim: true },
      town: { type: String, trim: true },
    },
    delivery: {
      pickup: { type: Boolean, default: true },
      delivery: { type: Boolean, default: false },
      fee: { type: Number, default: 0, min: 0 },
    },
    status: {
      type: String,
      enum: ["active", "sold_out", "expired", "archived", "suspended"],
      default: "active",
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Indexes make the browse and expiry queries fast
listingSchema.index({ status: 1, expiresAt: 1 });
listingSchema.index({ category: 1, status: 1 });
listingSchema.index({ "location.region": 1 });
listingSchema.index({ seller: 1, status: 1 });

export default mongoose.model("Listing", listingSchema);