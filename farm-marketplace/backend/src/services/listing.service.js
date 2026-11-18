import Listing from "../models/Listing.js";
import { HttpError } from "../middleware/error.middleware.js";
import { deleteStoredImage } from "../utils/files.js";

const DAY_MS = 24 * 60 * 60 * 1000;

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// The database job may not have run yet, so we also compute the status here.
export const toPublic = (doc) => {
  const obj = doc.toObject();
  if (obj.status === "active" && obj.expiresAt <= new Date()) obj.status = "expired";
  return obj;
};

export const SELLER_FIELDS = "name sellerProfile.shopName sellerProfile.verified sellerProfile.ratingAvg";

export async function createListing(user, data, file) {
  const listing = await Listing.create({
    ...data,
    seller: user._id,
    image: file?.url,
    imageId: file?.publicId,
    status: data.quantityAvailable === 0 ? "sold_out" : "active",
  });
  return toPublic(listing);
}

// Public. Expired listings stay visible for 24 hours, then disappear.
export function buildBrowseFilter(q) {
  const cutoff = new Date(Date.now() - DAY_MS);
  const filter = {
    status: { $in: ["active", "sold_out", "expired"] },
    expiresAt: { $gt: cutoff },
  };

  if (q.q) filter.title = { $regex: escapeRegex(q.q), $options: "i" };
  if (q.category) filter.category = q.category;
  if (q.region) filter["location.region"] = { $regex: `^${escapeRegex(q.region)}$`, $options: "i" };
  if (q.minPrice !== undefined || q.maxPrice !== undefined) {
    filter.price = {};
    if (q.minPrice !== undefined) filter.price.$gte = q.minPrice;
    if (q.maxPrice !== undefined) filter.price.$lte = q.maxPrice;
  }
  return filter;
}

export async function browseListings(q) {
  const filter = buildBrowseFilter(q);

  const sortMap = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    ending_soon: { expiresAt: 1 },
  };

  const [docs, total] = await Promise.all([
    Listing.find(filter)
      .sort(sortMap[q.sort])
      .skip((q.page - 1) * q.limit)
      .limit(q.limit)
      .populate("seller", SELLER_FIELDS),
    Listing.countDocuments(filter),
  ]);

  return {
    items: docs.map(toPublic),
    page: q.page,
    limit: q.limit,
    total,
    pages: Math.ceil(total / q.limit),
  };
}

export async function getListingById(id) {
  const listing = await Listing.findById(id).populate("seller", SELLER_FIELDS);
  if (!listing || listing.status === "archived") {
    throw new HttpError(404, "Listing not found");
  }
  if (listing.expiresAt <= new Date(Date.now() - DAY_MS)) {
    throw new HttpError(404, "Listing not found");
  }
  return toPublic(listing);
}

// Seller dashboard: all of this seller's listings except archived ones
export async function getMyListings(user, status) {
  const filter = { seller: user._id, status: { $ne: "archived" } };
  if (status) filter.status = status;
  const docs = await Listing.find(filter).sort({ createdAt: -1 });
  return docs.map(toPublic);
}

// A seller can only touch their own listings (ownership check)
async function findOwned(user, id) {
  const listing = await Listing.findById(id);
  if (!listing || listing.status === "archived") {
    throw new HttpError(404, "Listing not found");
  }
  if (listing.seller.toString() !== user._id.toString()) {
    throw new HttpError(403, "This is not your listing");
  }
  return listing;
}

export async function updateListing(user, id, data, file) {
  const listing = await findOwned(user, id);
  const oldPicture = { image: listing.image, imageId: listing.imageId };

  Object.assign(listing, data);
  if (file) {
    listing.image = file.url;
    listing.imageId = file.publicId;
  }

  // Keep the status in step with stock and expiry. This also handles "Relist".
  if (listing.quantityAvailable === 0) {
    listing.status = "sold_out";
  } else if (listing.expiresAt > new Date()) {
    listing.status = "active";
  } else {
    listing.status = "expired";
  }

  await listing.save();
  if (file) await deleteStoredImage(oldPicture); // remove the replaced picture
  return toPublic(listing);
}

// "Delete" hides the listing instead of erasing it, because orders may refer to it
// Hides a listing for good and deletes its picture. Safe to call twice.
// "extra" lets a caller add conditions, so a listing that was relisted a moment ago is left alone.
// Hides a listing for good and deletes its picture. Safe to call twice.
export async function archiveListingById(id, extra = {}) {
  const old = await Listing.findOneAndUpdate(
    { _id: id, status: { $ne: "archived" }, ...extra },
    { $set: { status: "archived" }, $unset: { image: "", imageId: "" } }
  );
  if (old) await deleteStoredImage(old);
  return old;
}

export async function archiveListing(user, id) {
  const listing = await findOwned(user, id); // the ownership check stays
  await archiveListingById(listing._id);
}

// Called by the cron job. Safe to run as often as you like.
export async function runExpirySweep() {
  const now = new Date();
  const archiveCutoff = new Date(now.getTime() - DAY_MS);

  const expired = await Listing.updateMany(
    { status: { $in: ["active", "sold_out"] }, expiresAt: { $lte: now } },
    { $set: { status: "expired" } }
  );

  // More than 24 hours past the end time: archive one by one so each picture is deleted too
  const old = await Listing.find({
    status: { $in: ["active", "sold_out", "expired"] },
    expiresAt: { $lte: archiveCutoff },
  }).select("_id");

  let archived = 0;
  for (const { _id } of old) {
    if (await archiveListingById(_id, { expiresAt: { $lte: archiveCutoff } })) archived++;
  }

  return { expired: expired.modifiedCount, archived };
}

