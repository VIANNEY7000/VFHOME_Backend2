import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByEmail,
  getOrdersByStatus,
  updateOrderStatus
} from "../controller/order_controller.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getAllOrders);
router.get("/status/:status", getOrdersByStatus);
router.get("/customer/:email", getOrdersByEmail);
router.get("/:id", getOrderById);
router.put("/update/:id", updateOrderStatus);

export default router;