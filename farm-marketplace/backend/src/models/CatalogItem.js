import mongoose from "mongoose";
import { CATEGORIES } from "./Listing.js";

const variantSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true, maxlength: 40 }, // "1 kg", "Pack of 4"
  price: { type: Number, required: true, min: 0 },
});

const catalogItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    category: { type: String, enum: CATEGORIES, required: true },
    description: { type: String, trim: true, maxlength: 300 },
    image: { type: String }, // for example "/uploads/ab12cd.jpg"
    imageId: { type: String }, // Cloudinary's id for the picture, used to delete it
    variants: {
      type: [variantSchema],
      validate: [(v) => v.length > 0, "At least one size is required"],
    },
  },
  { timestamps: true }
);

catalogItemSchema.index({ category: 1, name: 1 });

export default mongoose.model("CatalogItem", catalogItemSchema);