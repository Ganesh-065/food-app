import { Router } from 'express';
import {
  getRestaurants,
  getRestaurant,
  getRestaurantMenu
} from '../controllers/restaurantController';

const router = Router();

// Get all restaurants
router.get('/', getRestaurants);

// Get a single restaurant
router.get('/:id', getRestaurant);

// Get restaurant menu
router.get('/:id/menu', getRestaurantMenu);

export default router;
