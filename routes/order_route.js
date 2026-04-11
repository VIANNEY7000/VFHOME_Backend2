import express from "express";
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus
} from "../controller/order_controller.js";
import { verifyToken, isAdmin } from '../middleware/auth_middleware.js';


const router = express.Router();

router.post("/create", verifyToken, createOrder);
router.get("/my-orders", verifyToken, getUserOrders);
router.get("/", verifyToken, isAdmin, getAllOrders);
router.put("/update/:id", verifyToken, isAdmin, updateOrderStatus);

export default router;