import { z } from "zod";
import { REGIONS } from "../config/regions.js";
import { cameroonPhone, personName, shopName, strongPassword, checkTown } from "./common.js";

export const registerSchema = z
  .object({
    name: personName,
    email: z.string().trim().toLowerCase().email("Enter a valid email address").max(120),
    phone: cameroonPhone.optional(),
    password: strongPassword,
    // Only these two values exist. Admin can never be chosen here.
    accountType: z.enum(["buyer", "seller"]).default("buyer"),
    shopName: shopName.optional(),
    region: z.enum(REGIONS).optional(),
    town: z.string().trim().max(60).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.accountType !== "seller") return;
    const need = (field, message) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message });
    if (!data.shopName) need("shopName", "Shop or farm name is required for sellers");
    if (!data.region) need("region", "Region is required for sellers");
    if (!data.town) need("town", "Town is required for sellers");
    checkTown(data, ctx);
  });

// Login does not check strength, so older accounts can still log in
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password").max(72),
});

export const sellerSchema = z
  .object({
    shopName,
    region: z.enum(REGIONS),
    town: z.string().trim().min(1, "Choose a town").max(60),
    bio: z.string().trim().max(500, "About you can be 500 characters at most").optional(),
  })
  .superRefine(checkTown);