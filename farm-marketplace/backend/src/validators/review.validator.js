import mongoose from "mongoose";
import { z } from "zod";

export const createReviewSchema = z.object({
  orderId: z.string().refine((v) => mongoose.isValidObjectId(v), "Invalid id"),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});