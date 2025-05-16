import { api } from './apiSlice';

// Define types
export interface CartItem {
  id: string;
  restaurantId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface CartResponse {
  status: string;
  data: Cart;
}

export interface AddToCartRequest {
  restaurantId: string;
  itemId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  itemId: string;
  quantity: number;
}

// Define cart API endpoints
export const cartApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get user's cart
    getCart: builder.query<CartResponse, void>({
      query: () => 'cart',
      providesTags: ['Cart'],
    }),

    // Add item to cart
    addToCart: builder.mutation<CartResponse, AddToCartRequest>({
      query: (data) => ({
        url: 'cart/add',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),

    // Update cart item quantity
    updateCartItem: builder.mutation<CartResponse, UpdateCartItemRequest>({
      query: (data) => ({
        url: 'cart/update',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),

    // Remove item from cart
    removeFromCart: builder.mutation<CartResponse, string>({
      query: (itemId) => ({
        url: `cart/remove/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    // Clear cart
    clearCart: builder.mutation<CartResponse, void>({
      query: () => ({
        url: 'cart/clear',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
  overrideExisting: false,
});

// Export auto-generated hooks
export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} = cartApi;
