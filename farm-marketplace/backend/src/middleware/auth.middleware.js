import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { HttpError } from "./error.middleware.js";

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new HttpError(401, "Please log in first");

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch {
      throw new HttpError(401, "Session expired, please log in again");
    }

    const user = await User.findById(payload.sub);
    if (!user) throw new HttpError(401, "Account no longer exists");
    if (user.status === "suspended") throw new HttpError(403, "Account suspended");

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// Usage: router.post("/", protect, requireRole("seller"), controller)
export const requireRole =
  (...allowed) =>
  (req, res, next) => {
    const ok = req.user.roles.some((r) => allowed.includes(r));
    if (!ok) return next(new HttpError(403, "You do not have permission"));
    next();
  };