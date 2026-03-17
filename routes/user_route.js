import express from 'express';
import { register, login } from '../controller/user_controller.js';
import { verifyToken, isAdmin } from '../middleware/auth_middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/protected', verifyToken, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user
  });
});
router.get('/admin', verifyToken, isAdmin, (req, res) => {
  res.json({ message: "Welcome Admin" });
});


export default router;