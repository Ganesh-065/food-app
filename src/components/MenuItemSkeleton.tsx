const MenuItemSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col md:flex-row animate-pulse">
      {/* Image Skeleton */}
      <div className="md:w-1/4 mb-4 md:mb-0 md:mr-4">
        <div className="w-full h-32 md:h-24 bg-gray-300 rounded-lg"></div>
      </div>

      {/* Content Skeleton */}
      <div className="md:w-3/4 flex flex-col flex-grow">
        <div className="flex justify-between">
          {/* Title Skeleton */}
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>

          {/* Price Skeleton */}
          <div className="h-6 bg-gray-300 rounded w-16"></div>
        </div>

        {/* Description Skeleton */}
        <div className="h-4 bg-gray-300 rounded w-full mt-2"></div>
        <div className="h-4 bg-gray-300 rounded w-4/5 mt-1"></div>

        {/* Add to Cart Skeleton */}
        <div className="flex items-center justify-between mt-auto pt-4">
          {/* Quantity Control Skeleton */}
          <div className="h-10 bg-gray-300 rounded-full w-24"></div>

          {/* Button Skeleton */}
          <div className="h-10 bg-gray-300 rounded-full w-32"></div>
        </div>
      </div>
    </div>
  );
};

// Array of skeletons for multiple loading states
export const MenuItemSkeletonList = ({ count = 5 }: { count?: number }) => {
  return (
    <div className="space-y-4">
      {Array(count)
        .fill(null)
        .map((_, index) => (
          <MenuItemSkeleton key={index} />
        ))}
    </div>
  );
};

export default MenuItemSkeleton;
