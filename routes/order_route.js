import express from "express";
import { createOrder, getAllOrders } from "../controller/order_controller.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getAllOrders);

export default router;