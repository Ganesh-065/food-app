import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiClock,
  FiMapPin,
  FiStar,
  FiArrowLeft,
  FiDollarSign,
  FiPhoneCall,
} from 'react-icons/fi';
import {
  useGetRestaurantByIdQuery,
  useGetRestaurantMenuQuery,
} from '../api/restaurantsApiSlice';
import { useGetRestaurantReviewsQuery } from '../api/reviewsApiSlice';
import MenuItem from '../components/MenuItem';
import { MenuItemSkeletonList } from '../components/MenuItemSkeleton';

// Define menu categories for filtering
const MenuCategories = [
  'All',
  'Popular',
  'Appetizers',
  'Main Dishes',
  'Sides',
  'Desserts',
  'Drinks',
];

const RestaurantPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State for menu category filter
  const [activeCategory, setActiveCategory] = useState('All');

  // Fetch restaurant details, menu, and reviews
  const {
    data: restaurant,
    isLoading: isLoadingRestaurant,
    error: restaurantError,
  } = useGetRestaurantByIdQuery(id);

  const {
    data: menu,
    isLoading: isLoadingMenu,
    error: menuError,
  } = useGetRestaurantMenuQuery(id);

  const {
    data: reviews,
    isLoading: isLoadingReviews,
  } = useGetRestaurantReviewsQuery(id);

  // Filter menu items by category
  const filteredMenuItems = menu?.data.filter((item) => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Popular') return item.popular;
    return item.category === activeCategory;
  });

  // Handle go back
  const handleGoBack = () => {
    navigate(-1);
  };

  // Determine available categories based on menu items
  const [availableCategories, setAvailableCategories] = useState(['All', 'Popular']);

  useEffect(() => {
    if (menu?.data) {
      const categories = new Set<string>();
      categories.add('All');
      categories.add('Popular');

      menu.data.forEach((item) => {
        if (item.category) {
          categories.add(item.category);
        }
      });

      setAvailableCategories(Array.from(categories));
    }
  }, [menu]);

  // Error states
  if (restaurantError) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Error loading restaurant</h2>
        <p className="text-gray-600 mb-6">We couldn't find the restaurant you're looking for.</p>
        <button
          onClick={handleGoBack}
          className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-dark"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <button
        onClick={handleGoBack}
        className="mb-4 flex items-center text-gray-600 hover:text-primary"
      >
        <FiArrowLeft className="mr-2" />
        Back to restaurants
      </button>

      {/* Restaurant Header */}
      {isLoadingRestaurant ? (
        <div className="animate-pulse">
          <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
        </div>
      ) : restaurant?.data && (
        <div>
          {/* Restaurant Image */}
          <div className="relative h-64 rounded-lg overflow-hidden mb-4">
            <img
              src={restaurant.data.image}
              alt={restaurant.data.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

            {/* Restaurant Status */}
            {!restaurant.data.isOpen && (
              <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Closed
              </div>
            )}

            {/* Restaurant Info */}
            <div className="absolute bottom-0 left-0 p-4 text-white">
              <h1 className="text-3xl font-bold mb-1">{restaurant.data.name}</h1>
              <p className="text-white/90 mb-2">{restaurant.data.cuisine}</p>

              <div className="flex flex-wrap items-center">
                {/* Rating */}
                <div className="flex items-center mr-4 mb-2">
                  <FiStar className="mr-1" />
                  <span>{restaurant.data.rating.toFixed(1)}</span>
                  <span className="text-white/80 ml-1">
                    ({reviews?.results || 0} reviews)
                  </span>
                </div>

                {/* Delivery Time */}
                <div className="flex items-center mr-4 mb-2">
                  <FiClock className="mr-1" />
                  <span>{restaurant.data.deliveryTime} min</span>
                </div>

                {/* Price Range */}
                <div className="flex items-center mb-2">
                  <FiDollarSign className="mr-1" />
                  <span>{restaurant.data.priceRange}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Restaurant Details */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-semibold mb-2">About</h2>
                <p className="text-gray-600">{restaurant.data.description}</p>
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex items-start">
                  <FiMapPin className="mt-1 mr-2 text-gray-600" />
                  <p className="text-gray-600">{restaurant.data.address}</p>
                </div>

                <div className="flex items-center">
                  <FiPhoneCall className="mr-2 text-gray-600" />
                  <p className="text-gray-600">+1 (234) 567-8900</p>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Categories */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex space-x-2 pb-2">
              {availableCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    activeCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Menu</h2>

            {menuError && (
              <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
                <p>Failed to load menu. Please try again later.</p>
              </div>
            )}

            {isLoadingMenu ? (
              <MenuItemSkeletonList count={5} />
            ) : filteredMenuItems?.length === 0 ? (
              <p className="text-gray-600 py-4">No items found in this category.</p>
            ) : (
              <div className="space-y-4">
                {filteredMenuItems?.map((item) => (
                  <MenuItem
                    key={item.id}
                    item={item}
                    restaurantId={id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Reviews</h2>

            {isLoadingReviews ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between">
                      <div className="h-5 bg-gray-300 rounded w-1/4 mb-2"></div>
                      <div className="h-5 bg-gray-300 rounded w-1/6"></div>
                    </div>
                    <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
                    <div className="h-4 bg-gray-300 rounded w-4/5"></div>
                  </div>
                ))}
              </div>
            ) : reviews?.data.length === 0 ? (
              <p className="text-gray-600 py-4">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews?.data.map((review) => (
                  <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{review.userName}</h3>
                      <div className="flex items-center bg-primary-light py-1 px-2 rounded text-sm">
                        <FiStar className="text-primary mr-1" size={14} />
                        <span className="font-medium">{review.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-1">{review.comment}</p>
                    <p className="text-gray-400 text-sm mt-2">
                      {new Date(review.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantPage;
