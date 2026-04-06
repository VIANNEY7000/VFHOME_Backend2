import express from "express";
import {
  initializePayment,
  verifyPayment,
  paystackWebhook
} from "../controller/paystack_controller.js";

const router = express.Router();

router.post("/paystack/initialize", initializePayment);
router.get("/paystack/verify/:reference", verifyPayment);
router.post("/paystack/webhook", paystackWebhook);

export default router;