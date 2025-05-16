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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.createReview = exports.getRestaurantReviews = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
// Path to store reviews data
const reviewsFilePath = path_1.default.join(__dirname, '../data/reviews.json');
// Initialize reviews file if it doesn't exist
if (!fs_1.default.existsSync(reviewsFilePath)) {
    fs_1.default.writeFileSync(reviewsFilePath, JSON.stringify({}), 'utf-8');
}
else {
    // Load existing reviews from file
    try {
        const reviewsData = fs_1.default.readFileSync(reviewsFilePath, 'utf-8');
        const reviews = JSON.parse(reviewsData);
        // If the file exists but is empty or not in the expected format, initialize it
        if (!reviews || typeof reviews !== 'object') {
            fs_1.default.writeFileSync(reviewsFilePath, JSON.stringify({}), 'utf-8');
        }
    }
    catch (error) {
        fs_1.default.writeFileSync(reviewsFilePath, JSON.stringify({}), 'utf-8');
    }
}
// Helper function to load reviews
const loadReviews = () => {
    try {
        const data = fs_1.default.readFileSync(reviewsFilePath, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        return {};
    }
};
// Helper function to save reviews
const saveReviews = (reviews) => {
    fs_1.default.writeFileSync(reviewsFilePath, JSON.stringify(reviews, null, 2), 'utf-8');
};
// Get reviews for a restaurant
exports.getRestaurantReviews = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { restaurantId } = req.params;
    if (!restaurantId) {
        res.status(400).json({
            status: 'fail',
            message: 'Please provide restaurant ID'
        });
        return;
    }
    const reviews = loadReviews();
    const restaurantReviews = reviews[restaurantId] || [];
    res.status(200).json({
        status: 'success',
        results: restaurantReviews.length,
        data: restaurantReviews
    });
}));
// Create a new review
exports.createReview = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({
            status: 'fail',
            message: 'Please log in to leave a review'
        });
        return;
    }
    const { restaurantId } = req.params;
    const { rating, comment } = req.body;
    if (!restaurantId || !rating || !comment) {
        res.status(400).json({
            status: 'fail',
            message: 'Please provide restaurant ID, rating, and comment'
        });
        return;
    }
    // Validate rating
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        res.status(400).json({
            status: 'fail',
            message: 'Rating must be a number between 1 and 5'
        });
        return;
    }
    const reviews = loadReviews();
    // Create restaurant reviews array if it doesn't exist
    if (!reviews[restaurantId]) {
        reviews[restaurantId] = [];
    }
    // Check if user has already reviewed this restaurant
    const existingReviewIndex = reviews[restaurantId].findIndex((review) => review.userId === req.user.id);
    const newReview = {
        id: (0, uuid_1.v4)(),
        userId: req.user.id,
        userName: req.user.name,
        rating: numRating,
        comment,
        date: new Date().toISOString()
    };
    if (existingReviewIndex !== -1) {
        // Update existing review
        reviews[restaurantId][existingReviewIndex] = Object.assign(Object.assign(Object.assign({}, reviews[restaurantId][existingReviewIndex]), newReview), { date: new Date().toISOString() // Update date
         });
    }
    else {
        // Add new review
        reviews[restaurantId].push(newReview);
    }
    // Save updated reviews
    saveReviews(reviews);
    res.status(201).json({
        status: 'success',
        data: newReview
    });
}));
// Delete a review
exports.deleteReview = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({
            status: 'fail',
            message: 'Please log in to delete a review'
        });
        return;
    }
    const { restaurantId, reviewId } = req.params;
    if (!restaurantId || !reviewId) {
        res.status(400).json({
            status: 'fail',
            message: 'Please provide restaurant ID and review ID'
        });
        return;
    }
    const reviews = loadReviews();
    // Check if restaurant has reviews
    if (!reviews[restaurantId]) {
        res.status(404).json({
            status: 'fail',
            message: 'No reviews found for this restaurant'
        });
        return;
    }
    // Find the review
    const reviewIndex = reviews[restaurantId].findIndex((review) => review.id === reviewId);
    if (reviewIndex === -1) {
        res.status(404).json({
            status: 'fail',
            message: 'Review not found'
        });
        return;
    }
    // Check if user is the author of the review or an admin
    if (reviews[restaurantId][reviewIndex].userId !== req.user.id &&
        req.user.role !== 'admin') {
        res.status(403).json({
            status: 'fail',
            message: 'You are not authorized to delete this review'
        });
        return;
    }
    // Remove the review
    reviews[restaurantId].splice(reviewIndex, 1);
    // Save updated reviews
    saveReviews(reviews);
    res.status(200).json({
        status: 'success',
        message: 'Review deleted successfully'
    });
}));
