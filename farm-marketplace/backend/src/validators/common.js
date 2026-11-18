import { z } from "zod";
import { TOWNS_BY_REGION } from "../config/regions.js";

// A person's name: letters, spaces and ' . -
export const personName = z
  .string()
  .trim()
  .min(2, "Enter your full name (at least 2 characters)")
  .max(80, "Name can be 80 characters at most")
  .regex(/^[\p{L}][\p{L}\s'’.-]*$/u, "Name can only have letters, spaces and ' . -");

// Cameroon mobile numbers: 9 digits starting with 6, with or without +237
export const cameroonPhone = z
  .string()
  .trim()
  .transform((s) => s.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^(\+?237)?6\d{8}$/, "Enter a valid mobile number, for example 677 12 34 56"))
  .transform((s) => s.replace(/^\+?237/, ""));

export const shopName = z
  .string()
  .trim()
  .min(2, "Shop name needs at least 2 characters")
  .max(80, "Shop name can be 80 characters at most")
  .regex(/^[\p{L}\p{N}\s'’().,&-]+$/u, "Shop name can only have letters, numbers, spaces and . , ( ) & ' -");

export const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be 72 characters or fewer")
  .regex(/[A-Z]/, "Password needs at least one capital letter")
  .regex(/[0-9]/, "Password needs at least one number")
  .regex(/[^A-Za-z0-9]/, "Password needs at least one special character");

// Use inside .superRefine() on an object that has a region and a town
export function checkTown(data, ctx) {
  if (data.region && data.town && !TOWNS_BY_REGION[data.region]?.includes(data.town)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["town"],
      message: "Choose a town from the list for that region",
    });
  }
}