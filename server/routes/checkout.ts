import { Router } from 'express';
import {
  createOrder,
  getUserOrders,
  getOrder
} from '../controllers/checkoutController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All checkout routes require authentication
router.use(protect);

// Create a new order
router.post('/', createOrder);

// Get all user orders
router.get('/orders', getUserOrders);

// Get a specific order
router.get('/orders/:id', getOrder);

export default router;
