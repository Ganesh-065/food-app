"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviewController_1 = require("../controllers/reviewController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Get reviews for a restaurant (public)
router.get('/restaurant/:restaurantId', reviewController_1.getRestaurantReviews);
// Protected routes
router.post('/restaurant/:restaurantId', authMiddleware_1.protect, reviewController_1.createReview);
router.delete('/restaurant/:restaurantId/:reviewId', authMiddleware_1.protect, reviewController_1.deleteReview);
exports.default = router;
