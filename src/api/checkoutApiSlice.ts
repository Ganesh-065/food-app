import { api } from './apiSlice';
import { CartItem } from './cartApiSlice';

// Define types
export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  paymentMethod: string;
  deliveryAddress: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryTime: number;
}

export interface OrderResponse {
  status: string;
  data: Order;
}

export interface OrdersResponse {
  status: string;
  results: number;
  data: Order[];
}

export interface CheckoutRequest {
  paymentMethod: string;
  deliveryAddress: string;
}

// Define checkout API endpoints
export const checkoutApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new order
    createOrder: builder.mutation<OrderResponse, CheckoutRequest>({
      query: (orderData) => ({
        url: 'checkout',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Cart', 'Orders'],
    }),

    // Get user's orders
    getUserOrders: builder.query<OrdersResponse, void>({
      query: () => 'checkout/orders',
      providesTags: ['Orders'],
    }),

    // Get a specific order
    getOrder: builder.query<OrderResponse, string>({
      query: (orderId) => `checkout/orders/${orderId}`,
      providesTags: (result, error, id) => [{ type: 'Orders', id }],
    }),
  }),
  overrideExisting: false,
});

// Export auto-generated hooks
export const {
  useCreateOrderMutation,
  useGetUserOrdersQuery,
  useGetOrderQuery,
} = checkoutApi;
