import { Order } from "../models/order_model.js";


// CREATEB ORDER
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

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    const order = await Order.create({
      fullName,
      email,
      phone,
      address,
      city,
      state,
      country,
      items,
      totalPrice,
      paymentStatus: "Pending",
      orderStatus: "Pending"
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, totalOrders: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// GET USER ORDER
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ email: req.user.email })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.orderStatus = orderStatus;
    if (orderStatus === "Delivered") order.deliveredAt = new Date();
    await order.save();

    res.status(200).json({ success: true, message: "Order updated", order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};