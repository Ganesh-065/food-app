"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.createReview = exports.getRestaurantReviews = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const Review_1 = require("../models/Review");
// Get reviews for a restaurant
exports.getRestaurantReviews = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { restaurantId } = req.params;
    if (!restaurantId) {
        return res.status(400).json({
            status: 'fail',
            message: 'Please provide restaurant ID'
        });
    }
    const reviews = yield Review_1.Review.find({ restaurantId });
    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: reviews
    });
}));
// Create or update a review
exports.createReview = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({
            status: 'fail',
            message: 'Please log in to leave a review'
        });
    }
    const { restaurantId } = req.params;
    const { rating, comment } = req.body;
    if (!restaurantId || !rating || !comment) {
        return res.status(400).json({
            status: 'fail',
            message: 'Please provide restaurant ID, rating, and comment'
        });
    }
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({
            status: 'fail',
            message: 'Rating must be a number between 1 and 5'
        });
    }
    const reviewData = {
        restaurantId,
        userId: req.user.id,
        userName: req.user.name,
        rating: numRating,
        comment,
        date: new Date()
    };
    const updatedReview = yield Review_1.Review.findOneAndUpdate({ restaurantId, userId: req.user.id }, reviewData, { new: true, upsert: true, setDefaultsOnInsert: true });
    res.status(201).json({
        status: 'success',
        data: updatedReview
    });
}));
// Delete a review
exports.deleteReview = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({
            status: 'fail',
            message: 'Please log in to delete a review'
        });
    }
    const { restaurantId, reviewId } = req.params;
    if (!restaurantId || !reviewId) {
        return res.status(400).json({
            status: 'fail',
            message: 'Please provide restaurant ID and review ID'
        });
    }
    const review = yield Review_1.Review.findOne({ _id: reviewId, restaurantId });
    if (!review) {
        return res.status(404).json({
            status: 'fail',
            message: 'Review not found'
        });
    }
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            status: 'fail',
            message: 'You are not authorized to delete this review'
        });
    }
    yield review.deleteOne();
    res.status(200).json({
        status: 'success',
        message: 'Review deleted successfully'
    });
}));
