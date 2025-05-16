import { createSlice } from '@reduxjs/toolkit';
import { Cart, CartItem, cartApi } from '../../api/cartApiSlice';
import { RootState } from '../index';
import { checkoutApi } from '../../api/checkoutApiSlice';

// Define cart state
interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  cartId: string | null;
}

// Initial state
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  cartId: null,
};

// Helper to update cart from API response
const updateCartFromResponse = (state: CartState, cart: Cart) => {
  state.items = cart.items;
  state.totalItems = cart.totalItems;
  state.totalPrice = cart.totalPrice;
  state.cartId = cart.id;
};

// Create cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // We'll mostly rely on RTK Query, but we can add custom reducers here if needed
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
    },
  },
  extraReducers: (builder) => {
    // Handle get cart success
    builder.addMatcher(
      cartApi.endpoints.getCart.matchFulfilled,
      (state, { payload }) => {
        updateCartFromResponse(state, payload.data);
      }
    );

    // Handle add to cart success
    builder.addMatcher(
      cartApi.endpoints.addToCart.matchFulfilled,
      (state, { payload }) => {
        updateCartFromResponse(state, payload.data);
      }
    );

    // Handle update cart item success
    builder.addMatcher(
      cartApi.endpoints.updateCartItem.matchFulfilled,
      (state, { payload }) => {
        updateCartFromResponse(state, payload.data);
      }
    );

    // Handle remove from cart success
    builder.addMatcher(
      cartApi.endpoints.removeFromCart.matchFulfilled,
      (state, { payload }) => {
        updateCartFromResponse(state, payload.data);
      }
    );

    // Handle clear cart success
    builder.addMatcher(
      cartApi.endpoints.clearCart.matchFulfilled,
      (state, { payload }) => {
        updateCartFromResponse(state, payload.data);
      }
    );

    // Handle checkout success
    builder.addMatcher(
      checkoutApi.endpoints.createOrder.matchFulfilled,
      (state) => {
        state.items = [];
        state.totalItems = 0;
        state.totalPrice = 0;
      }
    );
  },
});

// Export actions and selectors
export const { clearCart } = cartSlice.actions;

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectTotalItems = (state: RootState) => state.cart.totalItems;
export const selectTotalPrice = (state: RootState) => state.cart.totalPrice;
export const selectCartId = (state: RootState) => state.cart.cartId;
export const selectIsCartEmpty = (state: RootState) => state.cart.items.length === 0;

export default cartSlice.reducer;
