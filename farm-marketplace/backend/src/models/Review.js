import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

reviewSchema.index({ order: 1 }, { unique: true }); // one review per order
reviewSchema.index({ seller: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);