import express from 'express';
import { register, login,  getAllUsers, forgotPassword, resetPassword} from '../controller/user_controller.js';
import { verifyToken, isAdmin } from '../middleware/auth_middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.get('/protected', verifyToken, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user
  });
});
router.get('/admin', verifyToken, isAdmin, (req, res) => {
  res.json({ message: "Welcome Admin" });
});

router.get('/', getAllUsers);


export default router;