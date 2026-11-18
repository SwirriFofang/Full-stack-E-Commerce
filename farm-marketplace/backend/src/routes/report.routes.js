import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { actionLimiter } from "../middleware/rateLimit.middleware.js";
import { createReportSchema } from "../validators/report.validator.js";
import * as report from "../controllers/report.controller.js";

const router = Router();

router.post("/", protect, actionLimiter, validate(createReportSchema), report.create);

export default router;