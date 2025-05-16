import { Link } from 'react-router-dom';
import { FiShoppingCart, FiArrowRight, FiTrash2 } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { useCart } from '../hooks/useCart';
import CartItem from '../components/CartItem';
import { useGetCartQuery } from '../api/cartApiSlice';

const CartPage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { clearCart, isLoading: isCartActionLoading } = useCart();

  // Fetch cart data
  const {
    data: cartData,
    error: cartError,
    isLoading: isCartLoading,
    refetch,
  } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Handle clear cart
  const handleClearCart = async () => {
    await clearCart();
    refetch();
  };

  // Showing a login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center max-w-md">
          <FiShoppingCart className="mx-auto text-gray-400 mb-4" size={64} />
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            Please log in to view your cart and place orders.
          </p>
          <Link
            to="/login"
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-full font-medium"
          >
            Log in to continue
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (isCartLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>

        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-4 flex">
            <div className="w-20 h-20 bg-gray-300 rounded-md mr-4"></div>
            <div className="flex-grow">
              <div className="h-5 bg-gray-300 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/6"></div>
            </div>
          </div>
        ))}

        <div className="h-40 bg-gray-300 rounded w-full mt-8"></div>
      </div>
    );
  }

  // Error state
  if (cartError) {
    return (
      <div className="bg-red-50 text-red-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Error loading cart</h2>
        <p>There was a problem loading your cart. Please try again later.</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty cart
  if (!cartData?.data.items || cartData.data.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center max-w-md">
          <FiShoppingCart className="mx-auto text-gray-400 mb-4" size={64} />
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            Browse our restaurants and add items to your cart.
          </p>
          <Link
            to="/"
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-full font-medium"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  // Cart with items
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <button
          onClick={handleClearCart}
          disabled={isCartActionLoading}
          className="text-red-500 hover:text-red-700 flex items-center"
        >
          <FiTrash2 className="mr-1" />
          Clear Cart
        </button>
      </div>

      {/* Cart Items */}
      <div className="mb-8">
        {cartData.data.items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>

      {/* Cart Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>${cartData.data.totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Fee</span>
            <span>$2.99</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span>${(cartData.data.totalPrice * 0.08).toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>
              ${(cartData.data.totalPrice + 2.99 + cartData.data.totalPrice * 0.08).toFixed(2)}
            </span>
          </div>
        </div>

        <Link
          to="/checkout"
          className="w-full bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-full font-medium flex items-center justify-center"
        >
          Proceed to Checkout
          <FiArrowRight className="ml-2" />
        </Link>
      </div>
    </div>
  );
};

export default CartPage;
