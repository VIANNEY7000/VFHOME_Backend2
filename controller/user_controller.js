import User from '../models/User.js';
import { Order } from '../models/order_model.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';


// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

  const existingUser = await User.findOne({ email });
   if (existingUser) return res.status(400).json({ message: 'User already exists' });

const hashedPassword = await bcrypt.hash(password, 10);

const newUser = new User({ name, email, password: hashedPassword });
await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
if (!user) return res.status(400).json({ message: 'Invalid credentials' });

const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




// GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); 

    res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      users
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching users",
      error: error.message
    });
  }
};





// DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





// UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, password, role } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;

    // ✅ Restrict role change
    if (role && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed to change role" });
    }

    if (role) user.role = role;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// GET USER
export const getMe = async (req, res) => {
  try {
    console.log("REQ.USER:", req.user); // 🔥 DEBUG

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }

    const orders = await Order.find({ email: user.email })
      .sort({ createdAt: -1 });

    res.json({
      user,
      orders
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};



// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields (ensure only allowed fields)
    const { name, email, address } = req.body;

    user.name = name || user.name;
    user.email = email || user.email;

    if (address) {
      user.address = {
        street: address.street || user.address?.street,
        city: address.city || user.address?.city,
        state: address.state || user.address?.state,
        zip: address.zip || user.address?.zip,
        country: address.country || user.address?.country,
      };
    }

    await user.save();

    res.status(200).json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// FORGOTTEN PASSWORD
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

   const resetLink = `https://vianney-fashion-home.vercel.app/#/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: `"Vianney Fashion Home" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Reset Your Password',
      html: `
        <h2>Password Reset</h2>
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>This link will expire in 10 minutes.</p>
      `
    });

    return res.status(200).json({
      message: 'Password reset link sent to your email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.json({ message: 'Password reset successful' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};




// ==========================================CART===================================================


// ADD TO CART
export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  // ✅ Validation
  if (!productId || !quantity) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    const user = await User.findById(req.user.id);

    // ✅ Ensure cart exists
    if (!user.cart) {
      user.cart = [];
    }

    const existingItem = user.cart.find(
      item => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ productId, quantity });
    }

    await user.save();

    res.json({
      message: "Item added to cart",
      cart: user.cart
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET CART
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("cart.productId"); // optional but powerful

    res.json({
      cart: user.cart
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// REMOVE FROM CART
export const removeFromCart = async (req, res) => {
  const { productId } = req.params; // ✅ FIX HERE

  if (!productId) {
    return res.status(400).json({ message: "Product ID required" });
  }

  try {
    const user = await User.findById(req.user.id);

    user.cart = user.cart.filter(
      item => item.productId.toString() !== productId
    );

    await user.save();

    res.json({
      message: "Item removed from cart",
      cart: user.cart
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// CLEAR CART
export const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.cart = []; // empty cart

    await user.save();

    res.json({
      message: "Cart cleared successfully",
      cart: user.cart
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// UPDATE CART QUANTITY
export const updateCartQuantity = async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || quantity < 1) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    const user = await User.findById(req.user.id);

    const item = user.cart.find(
      item => item.productId.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = quantity;

    await user.save();

    res.json({
      message: "Cart updated",
      cart: user.cart
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};