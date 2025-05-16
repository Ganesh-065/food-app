import { api } from './apiSlice';

// Define types
export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ReviewsResponse {
  status: string;
  results: number;
  data: Review[];
}

export interface ReviewResponse {
  status: string;
  data: Review;
}

export interface CreateReviewRequest {
  rating: number;
  comment: string;
}

// Define reviews API endpoints
export const reviewsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get reviews for a restaurant
    getRestaurantReviews: builder.query<ReviewsResponse, string>({
      query: (restaurantId) => `reviews/restaurant/${restaurantId}`,
      providesTags: (result, error, id) => [{ type: 'Reviews', id }],
    }),

    // Create a new review
    createReview: builder.mutation<ReviewResponse, { restaurantId: string; reviewData: CreateReviewRequest }>({
      query: ({ restaurantId, reviewData }) => ({
        url: `reviews/restaurant/${restaurantId}`,
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: (result, error, { restaurantId }) => [
        { type: 'Reviews', id: restaurantId },
        { type: 'Restaurant', id: restaurantId },
      ],
    }),

    // Delete a review
    deleteReview: builder.mutation<{ status: string; message: string }, { restaurantId: string; reviewId: string }>({
      query: ({ restaurantId, reviewId }) => ({
        url: `reviews/restaurant/${restaurantId}/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { restaurantId }) => [
        { type: 'Reviews', id: restaurantId },
        { type: 'Restaurant', id: restaurantId },
      ],
    }),
  }),
  overrideExisting: false,
});

// Export auto-generated hooks
export const {
  useGetRestaurantReviewsQuery,
  useCreateReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi;
