import { Link } from 'react-router-dom';
import { FiClock, FiStar } from 'react-icons/fi';
import { Restaurant } from '../api/restaurantsApiSlice';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  const {
    id,
    name,
    cuisine,
    rating,
    deliveryTime,
    priceRange,
    image,
    isOpen,
  } = restaurant;

  return (
    <Link
      to={`/restaurant/${id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg block"
    >
      <div className="relative">
        {/* Restaurant Image */}
        <img
          src={image}
          alt={name}
          className="w-full h-48 object-cover"
        />

        {/* Restaurant Status Badge */}
        {!isOpen && (
          <div className="absolute top-0 right-0 bg-gray-900 text-white text-xs font-semibold py-1 px-2 m-2 rounded">
            Closed
          </div>
        )}

        {/* Price Range Badge */}
        <div className="absolute top-0 left-0 bg-white text-gray-800 text-xs font-semibold py-1 px-2 m-2 rounded shadow-sm">
          {priceRange}
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          {/* Restaurant Name */}
          <h3 className="font-bold text-lg">{name}</h3>

          {/* Rating */}
          <div className="flex items-center bg-primary-light py-1 px-2 rounded">
            <FiStar className="text-primary mr-1" size={14} />
            <span className="font-semibold text-sm">{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Cuisine */}
        <p className="text-gray-600 text-sm mt-1">{cuisine}</p>

        {/* Delivery Time */}
        <div className="flex items-center mt-3 text-gray-700">
          <FiClock size={14} className="mr-1" />
          <span className="text-sm">{deliveryTime} min</span>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
