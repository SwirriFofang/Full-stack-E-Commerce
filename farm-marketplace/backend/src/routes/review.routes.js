import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { actionLimiter } from "../middleware/rateLimit.middleware.js";
import { createReviewSchema } from "../validators/review.validator.js";
import * as review from "../controllers/review.controller.js";

const router = Router();

router.use(protect);

router.post("/", actionLimiter, validate(createReviewSchema), review.create);
router.get("/mine", review.mine);

export default router;