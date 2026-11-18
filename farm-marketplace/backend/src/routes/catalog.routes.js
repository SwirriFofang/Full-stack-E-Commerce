import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/objectId.middleware.js";
import { receiveImage, storeImage } from "../middleware/upload.middleware.js";
import {
  createCatalogSchema,
  updateCatalogSchema,
  catalogQuerySchema,
} from "../validators/catalog.validator.js";
import * as catalog from "../controllers/catalog.controller.js";

const router = Router();

// Public: anyone can browse the catalogue
router.get("/", validate(catalogQuerySchema, "query"), catalog.list);

// Admin only
router.post("/", protect, requireRole("admin"), receiveImage, validate(createCatalogSchema), storeImage, catalog.create);
router.patch(
  "/:id",
  protect,
  requireRole("admin"),
  validateObjectId,
  receiveImage,
  validate(updateCatalogSchema),
  storeImage,
  catalog.update
);
router.delete("/:id", protect, requireRole("admin"), validateObjectId, catalog.remove);

export default router;