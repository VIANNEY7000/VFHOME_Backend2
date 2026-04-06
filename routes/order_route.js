import express from "express";
import {
  getAllOrders,
  updateOrderStatus
} from "../controller/order_controller.js";

const router = express.Router();

router.get("/", getAllOrders);
router.put("/update/:id", updateOrderStatus);

export default router;