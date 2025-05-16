import { useState } from 'react';
import { FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { CartItem as CartItemType } from '../api/cartApiSlice';
import { useCart } from '../hooks/useCart';

interface CartItemProps {
  item: CartItemType;
}

const CartItem = ({ item }: CartItemProps) => {
  const { updateItemQuantity, removeItem, isLoading } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle quantity update with debounce
  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity === 0) {
      await removeItem(item.id);
      return;
    }

    setIsUpdating(true);
    await updateItemQuantity(item.id, newQuantity);
    setIsUpdating(false);
  };

  // Handle remove item
  const handleRemoveItem = async () => {
    await removeItem(item.id);
  };

  return (
    <div className="border-b border-gray-200 py-4 flex items-center">
      {/* Item Image */}
      <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Item Details */}
      <div className="ml-4 flex-grow">
        <h3 className="font-medium text-gray-800">{item.name}</h3>
        <p className="text-primary font-semibold mt-1">${item.price.toFixed(2)}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center">
        <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
          <button
            type="button"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={isLoading || isUpdating}
            className="p-1 md:p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Decrease quantity"
          >
            <FiMinus size={14} />
          </button>
          <span className="px-2 font-medium text-sm">{item.quantity}</span>
          <button
            type="button"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isLoading || isUpdating}
            className="p-1 md:p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Increase quantity"
          >
            <FiPlus size={14} />
          </button>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={handleRemoveItem}
          disabled={isLoading}
          className="ml-3 p-2 text-gray-500 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Remove item"
        >
          <FiTrash2 size={18} />
        </button>
      </div>

      {/* Item Total */}
      <div className="ml-4 text-right w-20">
        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default CartItem;
