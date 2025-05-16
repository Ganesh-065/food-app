import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCreditCard, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser } from "../store/slices/authSlice";
import { useGetCartQuery } from "../api/cartApiSlice";
import { useCreateOrderMutation } from "../api/checkoutApiSlice";
import { showNotification } from "../store/slices/uiSlice";
import CartItem from "../components/CartItem";

// Payment method options
const PAYMENT_METHODS = [
  { id: "credit_card", name: "Credit Card", icon: <FiCreditCard /> },
  {
    id: "paypal",
    name: "PayPal",
    icon: (
      <img
        src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"
        alt="PayPal"
        className="h-5 w-auto"
      />
    ),
  },
  {
    id: "cash",
    name: "Cash on Delivery",
    icon: <span className="text-lg">💵</span>,
  },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const user = useSelector(selectCurrentUser);

  // State for form
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Credit card form state (simplified for demo)
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  // Get cart data
  const { data: cartData, isLoading: isCartLoading } = useGetCartQuery();

  // Create order mutation
  const [createOrder, { isLoading: isOrderLoading }] = useCreateOrderMutation();

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "deliveryAddress") {
      setDeliveryAddress(value);
    } else if (name.startsWith("card_")) {
      const field = name.replace("card_", "");
      setCardDetails((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Handle payment method selection
  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
  };

  // Handle checkout form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validate form
    if (!deliveryAddress.trim()) {
      setFormError("Please enter your delivery address");
      return;
    }

    // Additional validation for credit card
    if (paymentMethod === "credit_card") {
      const { number, name, expiry, cvv } = cardDetails;

      if (!number.trim() || !name.trim() || !expiry.trim() || !cvv.trim()) {
        setFormError("Please fill in all credit card fields");
        return;
      }
    }

    try {
      setIsSubmitting(true);

      // Send request to create order
      await createOrder({
        paymentMethod,
        deliveryAddress,
      }).unwrap();

      // Show success notification
      dispatch(
        showNotification({
          type: "success",
          message: "Order placed successfully! Your food is on the way.",
        })
      );

      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error("Failed to place order:", error);
      setFormError("Failed to place your order. Please try again.");

      dispatch(
        showNotification({
          type: "error",
          message: "Failed to place your order. Please try again.",
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total
  const calculateTotal = () => {
    if (!cartData?.data) return 0;

    const subtotal = cartData.data.totalPrice;
    const deliveryFee = 2.99;
    const tax = subtotal * 0.08;

    return subtotal + deliveryFee + tax;
  };

  // Loading state
  if (isCartLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="h-40 bg-gray-300 rounded"></div>
            <div className="h-60 bg-gray-300 rounded"></div>
          </div>
          <div className="h-80 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  // No items in cart
  if (!cartData?.data.items || cartData.data.items.length === 0) {
    return (
      <div className="text-center py-12">
        <FiAlertCircle className="text-gray-400 mx-auto mb-4" size={64} />
        <h1 className="text-2xl font-bold mb-4">No items in your cart</h1>
        <p className="text-gray-600 mb-6">
          You need to add items to your cart before checkout.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-primary text-white rounded-full font-medium"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Form */}
        <div>
          <form onSubmit={handleSubmit}>
            {/* Delivery Address */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
              <textarea
                name="deliveryAddress"
                value={deliveryAddress}
                onChange={handleInputChange}
                placeholder="Enter your full delivery address"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                required
              />
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <label key={method.id} className="block">
                    <div
                      className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                        paymentMethod === method.id
                          ? "border-primary bg-primary-light"
                          : "border-gray-300 hover:border-primary"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => handlePaymentMethodChange(method.id)}
                        className="sr-only"
                      />
                      <div className="flex items-center">
                        <span className="text-lg mr-3">{method.icon}</span>
                        <span className="font-medium">{method.name}</span>
                      </div>
                      {paymentMethod === method.id && (
                        <FiCheckCircle className="ml-auto text-primary" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Credit Card Details (Show only if credit card is selected) */}
            {paymentMethod === "credit_card" && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-3">Card Details</h3>
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="card_number"
                      className="block text-sm text-gray-600 mb-1"
                    >
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="card_number"
                      name="card_number"
                      value={cardDetails.number}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="card_name"
                      className="block text-sm text-gray-600 mb-1"
                    >
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      id="card_name"
                      name="card_name"
                      value={cardDetails.name}
                      onChange={handleInputChange}
                      placeholder="John Smith"
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="card_expiry"
                        className="block text-sm text-gray-600 mb-1"
                      >
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="card_expiry"
                        name="card_expiry"
                        value={cardDetails.expiry}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="card_cvv"
                        className="block text-sm text-gray-600 mb-1"
                      >
                        CVV
                      </label>
                      <input
                        type="text"
                        id="card_cvv"
                        name="card_cvv"
                        value={cardDetails.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {formError && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg">
                {formError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isOrderLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-full font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting || isOrderLoading ? "Processing..." : "Place Order"}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            {/* Items */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Items</h3>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {cartData.data.items.map((item) => (
                  <div key={item.id} className="flex items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-md mr-3"
                    />
                    <div className="flex-grow">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-500">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${cartData.data.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>$2.99</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span>${(cartData.data.totalPrice * 0.08).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
