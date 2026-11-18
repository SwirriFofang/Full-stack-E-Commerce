
import CatalogItem from "../models/CatalogItem.js";
import { HttpError } from "../middleware/error.middleware.js";
import { deleteStoredImage } from "../utils/files.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Public
export async function listCatalog(q) {
  const filter = {};
  if (q.category) filter.category = q.category;
  if (q.q) filter.name = { $regex: escapeRegex(q.q), $options: "i" };

  const [items, total] = await Promise.all([
    CatalogItem.find(filter)
      .sort({ category: 1, name: 1 })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit),
    CatalogItem.countDocuments(filter),
  ]);
  return { items, page: q.page, total, pages: Math.ceil(total / q.limit) };
}

// Admin only (the route enforces that)
export async function createCatalogItem(data, file) {
  return CatalogItem.create({ ...data, image: file?.url, imageId: file?.publicId });
}

export async function updateCatalogItem(id, data, file) {
  const item = await CatalogItem.findById(id);
  if (!item) throw new HttpError(404, "Catalogue item not found");

  const oldPicture = { image: item.image, imageId: item.imageId };
  Object.assign(item, data);
  if (file) {
    item.image = file.url;
    item.imageId = file.publicId;
  }
  await item.save();

  if (file) await deleteStoredImage(oldPicture); // remove the replaced picture
  return item;
}

export async function deleteCatalogItem(id) {
  const item = await CatalogItem.findByIdAndDelete(id);
  if (!item) throw new HttpError(404, "Catalogue item not found");
  await deleteStoredImage(item);
}