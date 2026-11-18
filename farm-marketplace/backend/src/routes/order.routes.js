import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/objectId.middleware.js";
import { actionLimiter } from "../middleware/rateLimit.middleware.js";
import { createOrderSchema, updateStatusSchema, sellingQuerySchema } from "../validators/order.validator.js";
import * as order from "../controllers/order.controller.js";


const router = Router();

// Every order route requires an account
router.use(protect);

router.post("/", actionLimiter, validate(createOrderSchema), order.create);
router.get("/mine", order.mine);
router.get("/selling", requireRole("seller"), validate(sellingQuerySchema, "query"), order.selling); // before "/:id"
router.get("/:id", validateObjectId, order.getOne);
router.post("/:id/pay", actionLimiter, validateObjectId, order.pay);
router.post("/:id/cancel", actionLimiter, validateObjectId, order.cancel);
router.post("/:id/received", actionLimiter, validateObjectId, order.received);
router.patch(
  "/:id/status",
  requireRole("seller", "admin"),
  validateObjectId,
  validate(updateStatusSchema),
  order.updateStatus
);

export default router;

