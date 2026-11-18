import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  skip: () => process.env.NODE_ENV === "test",
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: { message: "Too many attempts, try again in 15 minutes" },
});

// Limits sensitive actions like placing orders and paying
export const actionLimiter = rateLimit({
  skip: () => process.env.NODE_ENV === "test",
  windowMs: 15 * 60 * 1000,
  limit: 60,
  message: { message: "Too many requests, slow down" },
});