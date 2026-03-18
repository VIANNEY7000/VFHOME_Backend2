import User from '../models/User.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
   if (existingUser) return res.status(400).json({ message: 'User already exists' });

const hashedPassword = await bcrypt.hash(password, 10);

const newUser = new User({ name, email, password: hashedPassword, role});
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

    res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
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



// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // generate token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // save hashed token (security)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save();

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    //  send email (we’ll configure later)
    console.log("Reset link:", resetLink);

    // ✅ include resetLink in response
    res.status(200).json({
      message: "Password reset link sent",
      resetLink: resetLink
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // hash new password
    user.password = await bcrypt.hash(password, 10);

    // clear token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};