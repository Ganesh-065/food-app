import { Router } from 'express';
import {
  login,
  register,
  getCurrentUser,
  logout
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Register a new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get current user
router.get('/me', protect, getCurrentUser);

// Logout user
router.get('/logout', logout);

export default router;
