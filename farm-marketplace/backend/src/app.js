import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import listingRoutes from "./routes/listing.routes.js";
import orderRoutes from "./routes/order.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import reportRoutes from "./routes/report.routes.js";
import { UPLOAD_DIR } from "./middleware/upload.middleware.js";
import catalogRoutes from "./routes/catalog.routes.js";
import productRoutes from "./routes/product.routes.js";
import accountRoutes from "./routes/account.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import sellerRoutes from "./routes/seller.routes.js";


const app = express();


app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "7d" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 })); // global limit
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/products", productRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/seller", sellerRoutes);


app.use(notFound);
app.use(errorHandler);

export default app;