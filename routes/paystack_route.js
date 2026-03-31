import express from "express";
import {
  initializePayment,
  verifyPayment,
  paystackWebhook
} from "../controller/paystack_controller.js";

const router = express.Router();

router.post("/initialize", initializePayment);
router.get("/verify/:reference", verifyPayment);
router.post("/webhook", paystackWebhook);

export default router;