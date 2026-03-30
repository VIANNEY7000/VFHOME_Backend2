import { Order } from "../models/order_model.js";

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      address,
      city,
      state,
      country,
      items,
      totalPrice
    } = req.body;

    if (
      !fullName ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !country ||
      !items ||
      items.length === 0 ||
      !totalPrice
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const newOrder = await Order.create({
      fullName,
      email,
      phone,
      address,
      city,
      state,
      country,
      items,
      totalPrice,
      paymentStatus: paymentStatus || "Pending",
      paymentReference: paymentReference || ""
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// GET ALL ORDERS
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};