import { z } from "zod";
import { REGIONS } from "../config/regions.js";
import { cameroonPhone, personName, strongPassword, checkTown } from "./common.js";

export const addressSchema = z
  .object({
    label: z
      .string()
      .trim()
      .min(1, "Give the address a name, like Home or Work")
      .max(30, "The name can be 30 characters at most")
      .regex(/^[\p{L}\p{N}\s'’.-]+$/u, "The name can only have letters and numbers"),
    region: z.enum(REGIONS),
    town: z.string().trim().min(1, "Choose a town").max(60),
    details: z.string().trim().max(200, "Directions can be 200 characters at most").optional(),
  })
  .superRefine(checkTown);

export const profileSchema = z.object({
  name: personName,
  phone: cameroonPhone.optional(), // leaving it out removes the number
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password").max(72),
  newPassword: strongPassword,
});