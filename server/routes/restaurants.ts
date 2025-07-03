import { Router } from 'express';
import {
  getRestaurants,
  getRestaurant,
  getRestaurantMenu,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
} from '../controllers/restaurantController';

const router = Router();

// Get all restaurants
router.get('/', getRestaurants);

// Get a single restaurant
router.get('/:id', getRestaurant);

// Get restaurant menu
router.get('/:id/menu', getRestaurantMenu);

// Create a new restaurant (Admin only)
router.post('/', createRestaurant);

// Update a restaurant (Admin only)
router.put('/:id', updateRestaurant);

// Delete a restaurant (Admin only)
router.delete('/:id', deleteRestaurant);

export default router;
