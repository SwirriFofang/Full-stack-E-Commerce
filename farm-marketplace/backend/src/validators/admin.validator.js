import { z } from "zod";

const paging = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
};

export const userQuerySchema = z.object({
  q: z.string().trim().max(60).optional(),
  role: z.enum(["customer", "seller", "admin"]).optional(),
  status: z.enum(["active", "suspended"]).optional(),
  verified: z.enum(["true", "false"]).optional(),
  ...paging,
});

export const setUserStatusSchema = z.object({
  status: z.enum(["active", "suspended"]),
});

export const verifySellerSchema = z.object({
  verified: z.boolean(),
});

export const adminListingQuerySchema = z.object({
  status: z.enum(["active", "sold_out", "expired", "archived", "suspended"]).optional(),
  q: z.string().trim().max(60).optional(),
  ...paging,
});

export const reportQuerySchema = z.object({
  status: z.enum(["open", "resolved", "dismissed"]).default("open"),
  ...paging,
});

export const resolveReportSchema = z.object({
  status: z.enum(["resolved", "dismissed"]),
  adminNote: z.string().trim().max(500).optional(),
  removeTarget: z.boolean().default(false), // for a listing report: take the listing down
});

export const adminOrderQuerySchema = z.object({
  status: z.enum(["pending", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"]).optional(),
});