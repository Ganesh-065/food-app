"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const restaurantController_1 = require("../controllers/restaurantController");
const router = (0, express_1.Router)();
// Get all restaurants
router.get('/', restaurantController_1.getRestaurants);
// Get a single restaurant
router.get('/:id', restaurantController_1.getRestaurant);
// Get restaurant menu
router.get('/:id/menu', restaurantController_1.getRestaurantMenu);
exports.default = router;
