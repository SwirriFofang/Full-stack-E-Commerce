import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { previewQuerySchema, productQuerySchema } from "../validators/product.validator.js";
import * as product from "../controllers/product.controller.js";

const router = Router();

// Public: anyone can browse
router.get("/", validate(productQuerySchema, "query"), product.list);
router.get("/preview", validate(previewQuerySchema, "query"), product.preview);

export default router;