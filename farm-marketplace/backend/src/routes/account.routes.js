import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/objectId.middleware.js";
import { authLimiter } from "../middleware/rateLimit.middleware.js";
import { addressSchema, profileSchema, passwordSchema } from "../validators/account.validator.js";
import * as account from "../controllers/account.controller.js";

const router = Router();

router.use(protect);

router.get("/addresses", account.listAddresses);
router.post("/addresses", validate(addressSchema), account.addAddress);
router.delete("/addresses/:id", validateObjectId, account.removeAddress);

router.patch("/profile", validate(profileSchema), account.updateProfile);
router.post("/password", authLimiter, validate(passwordSchema), account.changePassword); // limited, like login

export default router;