import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import Listing from "../src/models/Listing.js";
import CatalogItem from "../src/models/CatalogItem.js";
import { uploadImageBuffer } from "../src/config/cloudinary.js";

const UPLOAD_DIR = path.resolve("uploads");

await mongoose.connect(process.env.MONGO_URI);

let moved = 0;
let missing = 0;

for (const Model of [Listing, CatalogItem]) {
  const docs = await Model.find({ image: { $regex: "^/uploads/" } }).select("image");
  for (const doc of docs) {
    try {
      const buffer = await fs.readFile(path.join(UPLOAD_DIR, path.basename(doc.image)));
      const { url, publicId } = await uploadImageBuffer(buffer);
      await Model.updateOne({ _id: doc._id }, { $set: { image: url, imageId: publicId } });
      moved++;
    } catch {
      console.log(`Could not move ${doc.image} (the file may be missing)`);
      missing++;
    }
  }
}

console.log(`${moved} picture(s) moved to Cloudinary, ${missing} could not be moved.`);
await mongoose.disconnect();