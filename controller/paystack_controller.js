import axios from "axios";
import { Order } from "../models/order_model.js";

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

    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });

    res.status(200).json({ success: true, data: response.data.data });
  } catch (error) {
    console.error("PAYSTACK VERIFY ERROR:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};

// Webhook to create order automatically
export const paystackWebhook = async (req, res) => {
  try {
    const event = req.body;

    if (event.event === "charge.success" && event.data.status === "success") {
      const metadata = event.data.metadata;

      const newOrder = await Order.create({
        fullName: metadata.fullName,
        email: metadata.email || event.data.customer.email,
        phone: metadata.phone,
        address: metadata.address,
        city: metadata.city,
        state: metadata.state,
        country: metadata.country,
        items: metadata.cartItems,
        totalPrice: metadata.totalPrice,
        paymentStatus: "Paid",
        paymentReference: event.data.reference,
        orderStatus: "Pending"
      });

      console.log("New order created from webhook:", newOrder._id);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    res.sendStatus(500);
  }
};