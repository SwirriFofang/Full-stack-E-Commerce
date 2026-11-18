import "./config/env.js";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { startListingExpiryJob } from "./jobs/listingExpiry.job.js";

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`API running on port ${port}`));
    startListingExpiryJob();
  })
  .catch((err) => {
    console.error("Failed to start:", err.message);
    process.exit(1);
  });