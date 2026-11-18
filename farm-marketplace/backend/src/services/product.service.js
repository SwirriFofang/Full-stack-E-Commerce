import CatalogItem from "../models/CatalogItem.js";
import Listing, { CATEGORIES } from "../models/Listing.js";
import { buildBrowseFilter, toPublic, SELLER_FIELDS } from "./listing.service.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const fromCatalog = (c) => ({
  _id: c._id,
  source: "catalog",
  name: c.name,
  category: c.category,
  description: c.description,
  image: c.image,
  variants: c.variants.map((v) => ({ _id: v._id, label: v.label, price: v.price })),
  status: "active",
  soldBy: { type: "platform", name: "FarmFresh", verified: true },
});

const fromListing = (l) => ({
  _id: l._id,
  source: "listing",
  name: l.title,
  category: l.category,
  description: l.description,
  image: l.image,
  variants: [{ _id: String(l._id), label: `1 ${l.unit}`, price: l.price }],
  status: l.status, // active, sold_out or expired
  unit: l.unit,
  quantityAvailable: l.quantityAvailable,
  expiresAt: l.expiresAt,
  location: l.location,
  delivery: l.delivery,
  soldBy: {
    type: "seller",
    sellerId: l.seller?._id,
    name: l.seller?.sellerProfile?.shopName || l.seller?.name || "Local seller",
    verified: Boolean(l.seller?.sellerProfile?.verified),
    rating: l.seller?.sellerProfile?.ratingAvg || 0,
  },
});

// Seller listings come first, then the FarmFresh catalogue from A to Z.
// One page is a slice of that combined list.
export async function browseProducts(q) {
  const limit = q.limit;
  const skip = (q.page - 1) * limit;

  const listingFilter = buildBrowseFilter({ q: q.q, category: q.category, region: q.region });
  const catalogFilter = {};
  if (q.category) catalogFilter.category = q.category;
  if (q.q) catalogFilter.name = { $regex: escapeRegex(q.q), $options: "i" };

  const [listingTotal, catalogTotal] = await Promise.all([
    Listing.countDocuments(listingFilter),
    CatalogItem.countDocuments(catalogFilter),
  ]);

  // How much of this page comes from each list
  const listingTake = Math.max(0, Math.min(limit, listingTotal - skip));
  const catalogSkip = Math.max(0, skip - listingTotal);
  const catalogTake = limit - listingTake;

  const [listingDocs, catalogDocs] = await Promise.all([
    listingTake > 0
      ? Listing.find(listingFilter)
          .sort({ createdAt: -1, _id: -1 })
          .skip(skip)
          .limit(listingTake)
          .populate("seller", SELLER_FIELDS)
      : [],
    catalogTake > 0
      ? CatalogItem.find(catalogFilter)
          .collation({ locale: "en" })
          .sort({ name: 1, _id: 1 })
          .skip(catalogSkip)
          .limit(catalogTake)
          .lean()
      : [],
  ]);

  const total = listingTotal + catalogTotal;
  return {
    items: [...listingDocs.map((d) => fromListing(toPublic(d))), ...catalogDocs.map(fromCatalog)],
    page: q.page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
}
// "All": the first few items of every category that has something in it
export async function previewProducts({ region, perCategory }) {
  const groups = await Promise.all(
    CATEGORIES.map(async (category) => {
      const result = await browseProducts({ category, region, page: 1, limit: perCategory });
      return { category, total: result.total, items: result.items };
    })
  );
  return { groups: groups.filter((g) => g.total > 0) };
}