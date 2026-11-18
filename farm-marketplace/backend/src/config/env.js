import "dotenv/config";
import { z } from "zod";


const secret = (name) =>
  z
    .string({ required_error: `${name} is missing` })
    .min(32, `${name} must be at least 32 characters long`)
    .refine((v) => !/change_me|put_a_long|put_another/i.test(v), `${name} still has the sample value`);

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().int().positive().default(5000),
    MONGO_URI: z.string({ required_error: "MONGO_URI is missing" }).min(1, "MONGO_URI is missing"),
    CLIENT_URL: z
      .string({ required_error: "CLIENT_URL is missing" })
      .url("CLIENT_URL must be a full web address, like http://localhost:5173")
      .refine((v) => !v.endsWith("/"), "CLIENT_URL must not end with a slash"),
    JWT_ACCESS_SECRET: secret("JWT_ACCESS_SECRET"),
    JWT_REFRESH_SECRET: secret("JWT_REFRESH_SECRET"),
    CLOUDINARY_CLOUD_NAME: z.string({ required_error: "CLOUDINARY_CLOUD_NAME is missing" }).min(1, "CLOUDINARY_CLOUD_NAME is missing"),
    CLOUDINARY_API_KEY: z.string({ required_error: "CLOUDINARY_API_KEY is missing" }).min(1, "CLOUDINARY_API_KEY is missing"),
    CLOUDINARY_API_SECRET: z.string({ required_error: "CLOUDINARY_API_SECRET is missing" }).min(1, "CLOUDINARY_API_SECRET is missing"),
  })
  .refine((e) => e.JWT_ACCESS_SECRET !== e.JWT_REFRESH_SECRET, {
    message: "The two JWT secrets must be different from each other",
    path: ["JWT_REFRESH_SECRET"],
  });

const result = schema.safeParse(process.env);
if (!result.success) {
  console.error("There is a problem with your .env file:");
  for (const issue of result.error.issues) console.error(` - ${issue.message}`);
  process.exit(1);
}