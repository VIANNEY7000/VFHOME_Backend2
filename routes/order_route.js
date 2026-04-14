import express from "express";
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
  getRevenueByMonth
} from "../controller/order_controller.js";
import { verifyToken, adminOnly } from '../middleware/auth_middleware.js';


const router = express.Router();

router.post("/create", verifyToken, createOrder);
router.get("/my-orders", verifyToken, getUserOrders);
router.get("/", verifyToken, adminOnly, getAllOrders);
router.put("/update/:id", verifyToken, adminOnly, updateOrderStatus);

router.get("/revenue-monthly", verifyToken, adminOnly, getRevenueByMonth);

export default router;