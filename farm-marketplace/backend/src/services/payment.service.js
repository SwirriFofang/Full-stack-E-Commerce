import crypto from "crypto";
import { HttpError } from "../middleware/error.middleware.js";

const PREFIX = { momo_mtn: "MTN", momo_orange: "OM", bank_transfer: "BANK" };

// MOCK: no real money moves. Replace this function with a real provider later.
export async function processPayment(order) {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_MOCK_PAYMENTS !== "true") {
    throw new HttpError(503, "Online payment is not available yet");
  }
  const prefix = PREFIX[order.paymentMethod] || "MOCK";
  return {
    reference: `${prefix}-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
    paidAt: new Date(),
  };
}