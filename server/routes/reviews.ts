import { Router } from 'express';
import {
  getRestaurantReviews,
  createReview,
  deleteReview
} from '../controllers/reviewController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Get reviews for a restaurant (public)
router.get('/restaurant/:restaurantId', getRestaurantReviews);

// Protected routes
router.post('/restaurant/:restaurantId', protect, createReview);
router.delete('/restaurant/:restaurantId/:reviewId', protect, deleteReview);

export default router;
