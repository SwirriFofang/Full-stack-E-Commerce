import mongoose from "mongoose";
import { z } from "zod";
import { REGIONS } from "../config/regions.js";
import { checkTown } from "./common.js";

const objectId = z.string().refine((v) => mongoose.isValidObjectId(v), "Invalid id");
// Cameroon mobile numbers: 9 digits starting with 6, with or without +237
const phone = z
  .string()
  .trim()
  .transform((s) => s.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^(\+?237)?6\d{8}$/, "Enter a valid mobile number, for example 677 12 34 56"))
  .transform((s) => s.replace(/^\+?237/, ""));

const lineSchema = z
  .object({
    source: z.enum(["catalog", "listing"]),
    itemId: objectId,

    variantId: objectId.optional(), // the chosen size, required for catalogue items
    quantity: z.coerce.number().positive().max(1000),
  })
  .refine((l) => l.source !== "catalog" || l.variantId, {
    message: "Size is required for catalogue items",
    path: ["variantId"],
  });

export const createOrderSchema = z
  .object({
    items: z.array(lineSchema).min(1).max(40),
    fulfilment: z.enum(["pickup", "delivery"]),
        address: z
      .object({
        region: z.enum(REGIONS),
        town: z.string().trim().min(1, "Choose a town").max(60),
        details: z.string().trim().max(200).optional(),
      })
      .superRefine(checkTown)
      .optional(),
      
    contact: z.object({
      name: z.string().trim().min(2).max(80),
      phone,
    }),
    payment: z.object({
      method: z.enum(["momo_mtn", "momo_orange", "bank_transfer"]),
      phone: phone.optional(),
    }),
    note: z.string().trim().max(200).optional(),
  })
  .refine((o) => o.fulfilment !== "delivery" || o.address, {
    message: "An address is required for delivery",
    path: ["address"],
  })
  .refine((o) => o.payment.method === "bank_transfer" || o.payment.phone, {
    message: "Enter the mobile money number you will pay with",
    path: ["payment", "phone"],
  });

export const updateStatusSchema = z.object({
  status: z.enum(["confirmed", "packed", "out_for_delivery", "cancelled"]),
});

export const sellingQuerySchema = z.object({
  status: z.enum(["pending", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"]).optional(),
});