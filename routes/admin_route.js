import express from "express";
import { getDashboardStats } from "../controller/admin_controller.js";
import { verifyToken, adminOnly } from "../middleware/auth_middleware.js";

const router = express.Router();

router.get("/stats", verifyToken , adminOnly, getDashboardStats);

export default router;