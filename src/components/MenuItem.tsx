import { useState } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { MenuItem as MenuItemType } from '../api/restaurantsApiSlice';
import { useCart } from '../hooks/useCart';

interface MenuItemProps {
  item: MenuItemType;
  restaurantId: string;
}

const MenuItem = ({ item, restaurantId }: MenuItemProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isLoading } = useCart();

  // Handle quantity change
  const handleIncreaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    await addToCart(restaurantId, item, quantity);
    setQuantity(1); // Reset quantity after adding to cart
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col md:flex-row">
      {/* Image */}
      <div className="md:w-1/4 mb-4 md:mb-0 md:mr-4">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-32 md:h-24 object-cover rounded-lg"
        />
      </div>

      {/* Content */}
      <div className="md:w-3/4 flex flex-col flex-grow">
        <div className="flex justify-between">
          <h3 className="font-semibold text-lg">{item.name}</h3>
          <span className="font-semibold text-lg">${item.price.toFixed(2)}</span>
        </div>

        <p className="text-gray-600 text-sm mt-1 mb-2">{item.description}</p>

        {/* Popular Badge */}
        {item.popular && (
          <span className="text-xs font-medium text-primary bg-primary-light py-1 px-2 rounded mt-1 self-start">
            Popular
          </span>
        )}

        {/* Add to Cart */}
        <div className="flex items-center justify-between mt-auto pt-3">
          {/* Quantity Selector */}
          <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
            <button
              type="button"
              onClick={handleDecreaseQuantity}
              disabled={quantity <= 1}
              className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <FiMinus size={16} />
            </button>
            <span className="px-2 font-medium">{quantity}</span>
            <button
              type="button"
              onClick={handleIncreaseQuantity}
              className="p-2 text-gray-600 hover:bg-gray-100"
              aria-label="Increase quantity"
            >
              <FiPlus size={16} />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isLoading}
            className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-full transition-colors text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
