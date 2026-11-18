import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["listing", "user"], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: {
      type: String,
      enum: ["not_food", "fake_or_scam", "wrong_info", "abusive", "other"],
      required: true,
    },
    details: { type: String, trim: true, maxlength: 500 },
    status: { type: String, enum: ["open", "resolved", "dismissed"], default: "open" },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminNote: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reporter: 1, targetType: 1, targetId: 1, status: 1 });

export default mongoose.model("Report", reportSchema);