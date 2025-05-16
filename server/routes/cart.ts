import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All cart routes require authentication
router.use(protect);

// Get the user's cart
router.get('/', getCart);

// Add item to cart
router.post('/add', addToCart);

// Update cart item quantity
router.put('/update', updateCartItem);

// Remove item from cart
router.delete('/remove/:itemId', removeFromCart);

// Clear cart
router.delete('/clear', clearCart);

export default router;
