
import path from "path";
import multer from "multer";
import sharp from "sharp";
import { HttpError } from "./error.middleware.js";
import { uploadImageBuffer } from "../config/cloudinary.js";

// Pictures uploaded before Cloudinary were kept here. They are still served until you move them.
export const UPLOAD_DIR = path.resolve("uploads");

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(), // kept in memory, never written to the server's disk
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (req, file, cb) =>
    ALLOWED_TYPES.has(file.mimetype)
      ? cb(null, true)
      : cb(new HttpError(400, "Only JPG, PNG or WEBP images are allowed")),
});

// Step 1, before validation: read the form and keep the picture in memory
export const receiveImage = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      const message = err.code === "LIMIT_FILE_SIZE" ? "Image must be 5 MB or smaller" : "Upload failed";
      return next(new HttpError(400, message));
    }
    next(err);
  });
};

// Step 2, after validation: check it is a real picture, shrink it and send it to Cloudinary
export const storeImage = async (req, res, next) => {
  if (!req.file) return next();

  let buffer;
  try {
    buffer = await sharp(req.file.buffer, { limitInputPixels: 40_000_000 })
      .rotate() // turns the picture upright, then the hidden data (including GPS) is dropped
      .resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();
  } catch {
    return next(new HttpError(400, "That file is not a valid picture"));
  }

  try {
    const { url, publicId } = await uploadImageBuffer(buffer);
    req.file = { url, publicId }; // if a later step fails, the error handler deletes it again
    next();
  } catch (err) {
    console.error("Cloudinary upload failed:", err.message);
    next(new HttpError(502, "The picture could not be saved. Please try again."));
  }
};