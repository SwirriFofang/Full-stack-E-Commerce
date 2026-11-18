import { z } from "zod";
import { CATEGORIES } from "../models/Listing.js";

export const productQuerySchema = z.object({
  q: z.string().trim().max(60).optional(),
  category: z.enum(CATEGORIES).optional(),
  region: z.string().trim().max(60).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(24),
});
export const previewQuerySchema = z.object({
  region: z.string().trim().max(60).optional(),
  perCategory: z.coerce.number().int().min(1).max(6).default(3),
});