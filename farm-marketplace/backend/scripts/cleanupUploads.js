// Finds picture files that no listing or catalogue item uses any more.
// Without --delete it only lists them.
import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import Listing from "../src/models/Listing.js";
import CatalogItem from "../src/models/CatalogItem.js";

const UPLOAD_DIR = path.resolve("uploads");
const MIN_AGE_MS = 24 * 60 * 60 * 1000; // never touch files from the last day
const dryRun = !process.argv.includes("--delete");

await mongoose.connect(process.env.MONGO_URI);

const used = new Set();
const sources = [
  [Listing, { status: { $ne: "archived" } }],
  [CatalogItem, {}],
];
for (const [Model, extra] of sources) {
  const docs = await Model.find({ image: { $exists: true, $ne: null }, ...extra }).select("image").lean();
  docs.forEach((d) => used.add(path.basename(d.image)));
}

let found = 0;
for (const name of await fs.readdir(UPLOAD_DIR)) {
  if (used.has(name)) continue;
  const file = path.join(UPLOAD_DIR, name);
  const stat = await fs.stat(file);
  if (!stat.isFile() || Date.now() - stat.mtimeMs < MIN_AGE_MS) continue;

  console.log(`${dryRun ? "Would delete" : "Deleting"}: ${name}`);
  if (!dryRun) await fs.unlink(file);
  found++;
}

console.log(
  dryRun
    ? `${found} unused file(s) found. Run again with --delete to remove them.`
    : `${found} unused file(s) deleted.`
);
await mongoose.disconnect();