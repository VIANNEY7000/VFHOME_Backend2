import axios from "axios";
import { Order } from "../models/order_model.js";
import User from "../models/User.js";
import crypto from "crypto";



// Initialize Payment
export const initializePayment = async (req, res) => {
  try {
    const { email, amount, metadata } = req.body;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      { email, amount, callback_url: "http://localhost:5173/payment-success", metadata },
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" } }
    );

    res.status(200).json({
      success: true,
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference
    });
  } catch (error) {
    console.error("PAYSTACK INIT ERROR:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Payment initialization failed" });
  }
};




// Verify Payment
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const data = response.data.data;

    if (data.status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Payment not successful"
      });
    }

    // ✅ Payment confirmed - webhook handles order creation
    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      email: data.customer.email,
      amount: data.amount / 100,
      reference: data.reference
    });

  } catch (error) {
    console.error("PAYSTACK VERIFY ERROR:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed"
    });
  }
};



// WEBHOOK
export const paystackWebhook = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    // 1. VERIFY PAYSTACK SIGNATURE (VERY IMPORTANT)
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).send("Invalid signature");
    }

    const event = req.body;

    // 2. ONLY PROCESS SUCCESSFUL PAYMENTS
    if (event.event === "charge.success" && event.data.status === "success") {
      const metadata = event.data.metadata;

      if (!metadata?.items || !metadata?.email) {
        return res.status(400).send("Missing metadata");
      }

      // 3. CREATE ORDER
      const order = await Order.create({
        userId: metadata.userId,
        fullName: metadata.fullName,
        email: metadata.email,
        phone: metadata.phone,
        address: metadata.address,
        city: metadata.city,
        state: metadata.state,
        country: metadata.country,
        items: metadata.items,
        totalPrice: metadata.totalPrice,
        paymentStatus: "Paid",
        paymentReference: event.data.reference,
        orderStatus: "Pending"
      });

      // 4. OPTIONAL: CLEAR USER CART
      await User.findOneAndUpdate(
        { email: metadata.email },
        { $set: { cart: [] } }
      );

      console.log("✅ Order created:", order._id);
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.sendStatus(500);
  }
};