import express from 'express';
import { register, login, forgotPassword, resetPassword, updateUser, deleteUser, getAllUsers } from '../controller/user_controller.js';
import { verifyToken, isAdmin } from '../middleware/auth_middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

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