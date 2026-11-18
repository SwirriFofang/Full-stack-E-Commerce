import { deleteCloudinaryImage } from "../config/cloudinary.js";
import { ZodError } from "zod";
import fs from "fs";

// Throw this from anywhere: throw new HttpError(404, "Listing not found")
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const notFound = (req, res) => {
  res.status(404).json({ message: "Route not found" });
};

export const errorHandler = (err, req, res, next) => {

  if (req.file?.publicId) deleteCloudinaryImage(req.file.publicId); // a failed request leaves no picture behind
  // ...the rest stays as it was
  // Input validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    });
  }

  // Duplicate value (for example, email already used)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({ message: `${field} already in use` });
  }

  const status = err.status || 500;
  if (status === 500) console.error(err);

  // Never leak internal error details to the client
  res.status(status).json({
    message: status === 500 ? "Something went wrong on the server" : err.message,
  });
};