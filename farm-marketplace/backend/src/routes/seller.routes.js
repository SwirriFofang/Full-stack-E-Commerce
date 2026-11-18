import { Router } from "express";
import { protect, requireRole } from "../middleware/auth.middleware.js";
import * as seller from "../controllers/seller.controller.js";

const router = Router();

router.use(protect, requireRole("seller"));
router.get("/stats", seller.stats);

export default router;