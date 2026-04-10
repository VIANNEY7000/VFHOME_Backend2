import express from 'express';
import { register, login, forgotPassword, resetPassword, updateUser, deleteUser, getAllUsers, getMe, addToCart, getCart, updateProfile, clearCart, removeFromCart } from '../controller/user_controller.js';
import { verifyToken, isAdmin } from '../middleware/auth_middleware.js';

const router = express.Router();

// Auth
router.post('/register', register);
router.post('/login', login);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.get('/me', verifyToken, getMe);
router.put('/me', verifyToken, updateProfile);

// Cart
router.post('/cart', verifyToken, addToCart);
router.get("/cart",verifyToken, getCart);
router.delete('/cart/remove', verifyToken, removeFromCart);
router.delete('/cart/clear', verifyToken, clearCart);


// Admin-only routes
router.get('/', verifyToken, isAdmin, getAllUsers);
router.put('/update/:id', verifyToken, isAdmin, updateUser);
router.delete('/delete/:id', verifyToken, isAdmin, deleteUser);

// Test routes
router.get('/protected', verifyToken, (req, res) => {
  res.json({ message: "Access granted", user: req.user });
});
router.get('/admin', verifyToken, isAdmin, (req, res) => {
  res.json({ message: "Welcome Admin" });
});

export default router;