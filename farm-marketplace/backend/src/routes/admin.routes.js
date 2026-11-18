import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/objectId.middleware.js";
import {
  userQuerySchema,
  setUserStatusSchema,
  verifySellerSchema,
  adminListingQuerySchema,
  reportQuerySchema,
  resolveReportSchema,
  adminOrderQuerySchema,
} from "../validators/admin.validator.js";
import * as admin from "../controllers/admin.controller.js";

const router = Router();

// Everything below needs login AND the admin role
router.use(protect, requireRole("admin"));

router.get("/stats", admin.stats);

router.get("/users", validate(userQuerySchema, "query"), admin.users);
router.patch("/users/:id/status", validateObjectId, validate(setUserStatusSchema), admin.setUserStatus);
router.patch("/users/:id/verify", validateObjectId, validate(verifySellerSchema), admin.verifySeller);

router.get("/listings", validate(adminListingQuerySchema, "query"), admin.listings);
router.delete("/listings/:id", validateObjectId, admin.removeListing);

router.get("/reports", validate(reportQuerySchema, "query"), admin.listReports);
router.patch("/reports/:id", validateObjectId, validate(resolveReportSchema), admin.resolveReport);

router.get("/orders", validate(adminOrderQuerySchema, "query"), admin.orders);

export default router;