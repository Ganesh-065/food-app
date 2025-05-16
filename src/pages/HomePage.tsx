import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiFilter, FiChevronDown, FiX } from 'react-icons/fi';
import {
  selectSearchQuery,
  selectFilters,
  setCuisineFilter,
  setSortFilter,
  clearFilters,
} from '../store/slices/uiSlice';
import { useGetRestaurantsQuery } from '../api/restaurantsApiSlice';
import RestaurantCard from '../components/RestaurantCard';
import { RestaurantSkeletonGrid } from '../components/RestaurantSkeleton';

const CUISINE_OPTIONS = [
  'All',
  'Italian',
  'Indian',
  'Chinese',
  'Japanese',
  'Mexican',
  'Thai',
  'American',
  'Mediterranean',
  'Vegan',
];

const HomePage = () => {
  const dispatch = useDispatch();
  const searchQuery = useSelector(selectSearchQuery);
  const filters = useSelector(selectFilters);

  // Pagination
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Reset page when filters or search change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filters.cuisine, filters.sort]);

  // Fetch restaurants
  const { data, error, isLoading, isFetching } = useGetRestaurantsQuery({
    page,
    limit: 6,
    cuisine: filters.cuisine === 'All' ? null : filters.cuisine,
    sort: filters.sort,
    search: searchQuery,
  });

  // Handle pagination
  const handleLoadMore = () => {
    if (data && data.pagination.next) {
      setPage(data.pagination.next.page);
    }
  };

  // Handle filter changes
  const handleCuisineChange = (cuisine: string) => {
    dispatch(setCuisineFilter(cuisine === 'All' ? null : cuisine));
  };

  const handleSortChange = (sort: 'rating' | 'deliveryTime' | null) => {
    dispatch(setSortFilter(sort));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  // Toggle filters on mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary-light rounded-lg p-6 mb-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Delicious food delivered to your door
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Order from your favorite restaurants and enjoy a hassle-free delivery experience
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <h2 className="text-2xl font-bold">Restaurants</h2>
          {searchQuery && (
            <p className="ml-4 text-gray-600">
              Search results for: <span className="font-medium">{searchQuery}</span>
            </p>
          )}
        </div>

        {/* Mobile Filter Toggle */}
        <button
          className="md:hidden flex items-center px-4 py-2 border border-gray-300 rounded-full mb-4"
          onClick={toggleFilters}
        >
          <FiFilter className="mr-2" />
          <span>Filters</span>
          <FiChevronDown className={`ml-2 transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Desktop Filters */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Cuisine Filter */}
          <div className="relative">
            <select
              value={filters.cuisine || 'All'}
              onChange={(e) => handleCuisineChange(e.target.value)}
              className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {CUISINE_OPTIONS.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
          </div>

          {/* Sort Filter */}
          <div className="relative">
            <select
              value={filters.sort || ''}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Sort By</option>
              <option value="rating">Rating (High to Low)</option>
              <option value="deliveryTime">Delivery Time (Fast to Slow)</option>
            </select>
            <FiChevronDown className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
          </div>

          {/* Clear Filters */}
          {(filters.cuisine || filters.sort) && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 text-primary hover:text-primary-dark flex items-center"
            >
              <FiX className="mr-1" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="md:hidden w-full mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-4">
              {/* Cuisine Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">Cuisine</label>
                <div className="relative">
                  <select
                    value={filters.cuisine || 'All'}
                    onChange={(e) => handleCuisineChange(e.target.value)}
                    className="w-full appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {CUISINE_OPTIONS.map((cuisine) => (
                      <option key={cuisine} value={cuisine}>
                        {cuisine}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">Sort By</label>
                <div className="relative">
                  <select
                    value={filters.sort || ''}
                    onChange={(e) => handleSortChange(e.target.value as any)}
                    className="w-full appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Default</option>
                    <option value="rating">Rating (High to Low)</option>
                    <option value="deliveryTime">Delivery Time (Fast to Slow)</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Clear Filters */}
              {(filters.cuisine || filters.sort) && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-2 text-primary hover:text-primary-dark flex items-center"
                >
                  <FiX className="mr-1" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
          <p>Failed to load restaurants. Please try again later.</p>
        </div>
      )}

      {/* Restaurant Grid */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Show skeleton while loading */}
          {isLoading ? (
            <RestaurantSkeletonGrid count={6} />
          ) : data?.data.length === 0 ? (
            // No Results
            <div className="col-span-full py-8 text-center">
              <p className="text-lg text-gray-600">
                No restaurants found. Try adjusting your filters or search query.
              </p>
            </div>
          ) : (
            // Restaurant cards
            <>
              {data?.data.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </>
          )}
        </div>

        {/* Load More Button */}
        {data && data.pagination.next && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              disabled={isFetching}
              className="px-6 py-3 bg-white border border-gray-300 rounded-full hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFetching ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
