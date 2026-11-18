
import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/objectId.middleware.js";
import { receiveImage, storeImage } from "../middleware/upload.middleware.js";
import {
  createListingSchema,
  updateListingSchema,
  browseQuerySchema,
  mineQuerySchema,
} from "../validators/listing.validator.js";
import * as listing from "../controllers/listing.controller.js";

const router = Router();

// Public: anyone can browse
router.get("/", validate(browseQuerySchema, "query"), listing.browse);

// Seller only. This must come BEFORE "/:id", or "mine" would be read as an id
router.get("/mine", protect, requireRole("seller"), validate(mineQuerySchema, "query"), listing.mine);

router.get("/:id", validateObjectId, listing.getOne);

router.post(
  "/",
  protect,
  requireRole("seller"),
  receiveImage,
  validate(createListingSchema),
  storeImage,
  listing.create
);
router.patch(
  "/:id",
  protect,
  requireRole("seller"),
  validateObjectId,
  receiveImage,
  validate(updateListingSchema),
  storeImage,
  listing.update
);
router.delete("/:id", protect, requireRole("seller"), validateObjectId, listing.remove);

export default router;