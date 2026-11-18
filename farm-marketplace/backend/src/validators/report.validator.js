import mongoose from "mongoose";
import { z } from "zod";

export const createReportSchema = z.object({
  targetType: z.enum(["listing", "user"]),
  targetId: z.string().refine((v) => mongoose.isValidObjectId(v), "Invalid id"),
  reason: z.enum(["not_food", "fake_or_scam", "wrong_info", "abusive", "other"]),
  details: z.string().trim().max(500).optional(),
});

export const sellingQuerySchema = z.object({
  status: z.enum(["pending", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"]).optional(),
});