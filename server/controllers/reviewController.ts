import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { Review } from '../models/Review';

// Get reviews for a restaurant
export const getRestaurantReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide restaurant ID'
      });
    }

    const reviews = await Review.find({ restaurantId });

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: reviews
    });
  }
);

// Create or update a review
export const createReview = asyncHandler(
  async (req: Request, res: Response) => {
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

    const updatedReview = await Review.findOneAndUpdate(
      { restaurantId, userId: req.user.id },
      reviewData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      status: 'success',
      data: updatedReview
    });
  }
);

// Delete a review
export const deleteReview = asyncHandler(
  async (req: Request, res: Response) => {
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

    const review = await Review.findOne({ _id: reviewId, restaurantId });

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

    await review.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Review deleted successfully'
    });
  }
);
