const RestaurantSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full h-48 bg-gray-300"></div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          {/* Name Skeleton */}
          <div className="h-6 bg-gray-300 rounded w-2/3"></div>

          {/* Rating Skeleton */}
          <div className="h-6 bg-gray-300 rounded w-10"></div>
        </div>

        {/* Cuisine Skeleton */}
        <div className="h-4 bg-gray-300 rounded w-1/3 mt-2"></div>

        {/* Delivery Time Skeleton */}
        <div className="h-4 bg-gray-300 rounded w-1/4 mt-4"></div>
      </div>
    </div>
  );
};

// Array of skeletons for multiple loading states
export const RestaurantSkeletonGrid = ({ count = 6 }: { count?: number }) => {
  return (
    <>
      {Array(count)
        .fill(null)
        .map((_, index) => (
          <RestaurantSkeleton key={index} />
        ))}
    </>
  );
};

export default RestaurantSkeleton;
