import { z } from "zod";
import { CATEGORIES, UNITS } from "../models/Listing.js";
import { REGIONS, TOWNS_BY_REGION } from "../config/regions.js";

// Multipart forms send nested values as JSON text, so accept an object or a JSON string
const json = (schema) =>
  z.preprocess((v) => {
    if (typeof v !== "string") return v;
    try {
      return JSON.parse(v);
    } catch {
      return undefined;
    }
  }, schema);

const futureDate = z.coerce
  .date()
  .refine((d) => d.getTime() > Date.now(), "The end time must be in the future. A date that has passed is not allowed.");

// The town must belong to the chosen region
const location = z
  .object({
    region: z.enum(REGIONS),
    town: z.string().trim().min(1, "Choose a town"),
  })
  .superRefine((loc, ctx) => {
    if (!TOWNS_BY_REGION[loc.region].includes(loc.town)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["town"],
        message: "Choose a town from the list for that region",
      });
    }
  });

const NAME_PATTERN = /^[\p{L}\p{N}\s'’().,&-]+$/u;

export const createListingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Food name needs at least 3 characters")
    .max(60, "Food name can be 60 characters at most")
    .regex(NAME_PATTERN, "Food name can only have letters, numbers, spaces and . , ( ) & ' -"),
  description: z.string().trim().max(300, "Description can be 300 characters at most").optional(),
  category: z.enum(CATEGORIES),
  price: z.coerce.number().int("Price must be a whole number").min(1, "Price must be at least 1").max(10_000_000),
  unit: z.enum(UNITS),
  quantityAvailable: z.coerce.number().positive("Quantity must be above 0").max(1_000_000),
  location: json(location),
  delivery: json(
    z.object({
      pickup: z.boolean().default(true),
      delivery: z.boolean().default(false),
      fee: z.coerce.number().int().min(0).max(1_000_000).default(0),
    })
  ).optional(),
  expiresAt: futureDate,
});

// Same fields, all optional, but at least one must be sent
export const updateListingSchema = createListingSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, "Send at least one field to update");

export const browseQuerySchema = z.object({
  q: z.string().trim().max(60).optional(),
  category: z.enum(CATEGORIES).optional(),
  region: z.string().trim().max(60).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "ending_soon"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const mineQuerySchema = z.object({
  status: z.enum(["active", "sold_out", "expired"]).optional(),
});