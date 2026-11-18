import fs from "fs/promises";
import path from "path";
import { UPLOAD_DIR } from "../middleware/upload.middleware.js";
import { deleteCloudinaryImage } from "../config/cloudinary.js";

// Deletes a stored picture: from Cloudinary, or (for older pictures) from the uploads folder
export async function deleteStoredImage({ image, imageId } = {}) {
  if (imageId) return deleteCloudinaryImage(imageId);
  if (image?.startsWith("/uploads/")) {
    await fs.unlink(path.join(UPLOAD_DIR, path.basename(image))).catch(() => {});
  }
}