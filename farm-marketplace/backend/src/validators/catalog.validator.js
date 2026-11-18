import mongoose from "mongoose";
import { z } from "zod";
import { CATEGORIES } from "../models/Listing.js";

// Accepts a real array (JSON request) or a JSON string (form-data request)
const variants = z.preprocess(
  (v) => {
    if (typeof v !== "string") return v;
    try {
      return JSON.parse(v);
    } catch {
      return undefined;
    }
  },
  z
    .array(
      z.object({
        _id: z
          .string()
          .refine((id) => mongoose.isValidObjectId(id), "Invalid id")
          .optional(),
        label: z.string().trim().min(1).max(40),
        price: z.coerce.number().min(0),
      })
    )
    .min(1)
    .max(8)
);

export const createCatalogSchema = z.object({
  name: z.string().trim().min(2).max(80),
  category: z.enum(CATEGORIES),
  description: z.string().trim().max(300).optional(),
  variants,
});

export const updateCatalogSchema = createCatalogSchema.partial();

export const catalogQuerySchema = z.object({
  q: z.string().trim().max(60).optional(),
  category: z.enum(CATEGORIES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(24),
});