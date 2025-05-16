import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Path to store reviews data
const reviewsFilePath = path.join(__dirname, '../data/reviews.json');

// Initialize reviews file if it doesn't exist
if (!fs.existsSync(reviewsFilePath)) {
  fs.writeFileSync(reviewsFilePath, JSON.stringify({}), 'utf-8');
} else {
  // Load existing reviews from file
  try {
    const reviewsData = fs.readFileSync(reviewsFilePath, 'utf-8');
    const reviews = JSON.parse(reviewsData);

    // If the file exists but is empty or not in the expected format, initialize it
    if (!reviews || typeof reviews !== 'object') {
      fs.writeFileSync(reviewsFilePath, JSON.stringify({}), 'utf-8');
    }
  } catch (error) {
    fs.writeFileSync(reviewsFilePath, JSON.stringify({}), 'utf-8');
  }
}

// Helper function to load reviews
const loadReviews = () => {
  try {
    const data = fs.readFileSync(reviewsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
};

// Helper function to save reviews
const saveReviews = (reviews: any) => {
  fs.writeFileSync(reviewsFilePath, JSON.stringify(reviews, null, 2), 'utf-8');
};

// Get reviews for a restaurant
export const getRestaurantReviews = asyncHandler(
  async (req: Request, res: Response) => {
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
  }
);

// Create a new review
export const createReview = asyncHandler(
  async (req: Request, res: Response) => {
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
    const existingReviewIndex = reviews[restaurantId].findIndex(
      (review: any) => review.userId === req.user.id
    );

    const newReview = {
      id: uuidv4(),
      userId: req.user.id,
      userName: req.user.name,
      rating: numRating,
      comment,
      date: new Date().toISOString()
    };

    if (existingReviewIndex !== -1) {
      // Update existing review
      reviews[restaurantId][existingReviewIndex] = {
        ...reviews[restaurantId][existingReviewIndex],
        ...newReview,
        date: new Date().toISOString() // Update date
      };
    } else {
      // Add new review
      reviews[restaurantId].push(newReview);
    }

    // Save updated reviews
    saveReviews(reviews);

    res.status(201).json({
      status: 'success',
      data: newReview
    });
  }
);

// Delete a review
export const deleteReview = asyncHandler(
  async (req: Request, res: Response) => {
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
    const reviewIndex = reviews[restaurantId].findIndex(
      (review: any) => review.id === reviewId
    );

    if (reviewIndex === -1) {
      res.status(404).json({
        status: 'fail',
        message: 'Review not found'
      });
      return;
    }

    // Check if user is the author of the review or an admin
    if (
      reviews[restaurantId][reviewIndex].userId !== req.user.id &&
      req.user.role !== 'admin'
    ) {
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
  }
);
