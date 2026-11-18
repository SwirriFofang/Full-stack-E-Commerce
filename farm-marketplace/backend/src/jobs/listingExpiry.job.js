import cron from "node-cron";
import { runExpirySweep } from "../services/listing.service.js";
import { autoCompleteOrders } from "../services/order.service.js";

async function sweep() {
  try {
    const { expired, archived } = await runExpirySweep();
    const completed = await autoCompleteOrders();
    if (expired || archived || completed) {
      console.log(`Sweep: ${expired} expired, ${archived} archived, ${completed} orders completed`);
    }
  } catch (err) {
    console.error("Sweep failed:", err.message);
  }
}

export function startListingExpiryJob() {
  sweep(); // run once at startup, in case the server was off for a while
  cron.schedule("*/5 * * * *", sweep);
}