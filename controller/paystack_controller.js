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
      { email, amount, callback_url: "https://vfhome-backend2-3.onrender.com/payment-success", metadata },
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



//PAYSTACK WEBHOOK
export const paystackWebhook = async (req, res) => {
  console.log("🔔 WEBHOOK HIT:", req.body?.event);
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    // ✅ Handle raw body correctly
    const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body));

    const hash = crypto
      .createHmac("sha512", secret)
      .update(rawBody) // ✅ use rawBody, not JSON.stringify(req.body)
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.log("❌ Invalid signature");
      return res.status(401).send("Invalid signature");
    }

    // ✅ Parse the body after signature check
    const event = req.body instanceof Buffer ? JSON.parse(req.body) : req.body;

    console.log("✅ Signature valid, event:", event.event);
    console.log("📦 Metadata:", JSON.stringify(event.data?.metadata));

    if (event.event === "charge.success" && event.data.status === "success") {
      const metadata = event.data.metadata;

      console.log("👤 userId:", metadata?.userId);
      console.log("📧 email:", metadata?.email);
      console.log("🛒 items:", metadata?.items);

      if (!metadata?.items || !metadata?.email) {
        console.log("❌ Missing metadata");
        return res.status(400).send("Missing metadata");
      }

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

      await User.findOneAndUpdate(
        { email: metadata.email },
        { $set: { cart: [] } }
      );

      console.log("✅ Order created:", order._id);
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("❌ Webhook error:", error.message);
    return res.sendStatus(500);
  }
};