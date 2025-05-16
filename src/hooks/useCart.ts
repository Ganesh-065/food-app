import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCartItems,
  selectTotalItems,
  selectTotalPrice,
  selectIsCartEmpty,
} from '../store/slices/cartSlice';
import {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} from '../api/cartApiSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { showNotification } from '../store/slices/uiSlice';
import { MenuItem } from '../api/restaurantsApiSlice';

// Custom hook to manage cart operations
export const useCart = () => {
  const dispatch = useDispatch();

  // Get cart state from Redux
  const items = useSelector(selectCartItems);
  const totalItems = useSelector(selectTotalItems);
  const totalPrice = useSelector(selectTotalPrice);
  const isEmpty = useSelector(selectIsCartEmpty);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // RTK Query hooks
  const { refetch } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [addToCartMutation, { isLoading: isAddLoading }] = useAddToCartMutation();
  const [updateCartItemMutation, { isLoading: isUpdateLoading }] = useUpdateCartItemMutation();
  const [removeFromCartMutation, { isLoading: isRemoveLoading }] = useRemoveFromCartMutation();
  const [clearCartMutation, { isLoading: isClearLoading }] = useClearCartMutation();

  // Add item to cart
  const addToCart = useCallback(
    async (restaurantId: string, item: MenuItem, quantity: number = 1) => {
      if (!isAuthenticated) {
        dispatch(
          showNotification({
            type: 'warning',
            message: 'Please login to add items to your cart',
          })
        );
        return false;
      }

      try {
        await addToCartMutation({
          restaurantId,
          itemId: item.id,
          quantity,
        }).unwrap();

        dispatch(
          showNotification({
            type: 'success',
            message: `${item.name} added to cart`,
          })
        );
        return true;
      } catch (error) {
        let errorMessage = 'Failed to add item to cart';

        // Handle specific error for adding items from different restaurants
        if (error && typeof error === 'object' && 'data' in error) {
          const errorData = error.data as any;
          if (errorData?.message) {
            errorMessage = errorData.message;
          }
        }

        dispatch(
          showNotification({
            type: 'error',
            message: errorMessage,
          })
        );
        return false;
      }
    },
    [addToCartMutation, dispatch, isAuthenticated]
  );

  // Update item quantity
  const updateItemQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (!isAuthenticated) {
        return false;
      }

      try {
        await updateCartItemMutation({
          itemId,
          quantity,
        }).unwrap();
        return true;
      } catch (error) {
        dispatch(
          showNotification({
            type: 'error',
            message: 'Failed to update item quantity',
          })
        );
        return false;
      }
    },
    [updateCartItemMutation, dispatch, isAuthenticated]
  );

  // Remove item from cart
  const removeItem = useCallback(
    async (itemId: string) => {
      if (!isAuthenticated) {
        return false;
      }

      try {
        await removeFromCartMutation(itemId).unwrap();
        dispatch(
          showNotification({
            type: 'info',
            message: 'Item removed from cart',
          })
        );
        return true;
      } catch (error) {
        dispatch(
          showNotification({
            type: 'error',
            message: 'Failed to remove item from cart',
          })
        );
        return false;
      }
    },
    [removeFromCartMutation, dispatch, isAuthenticated]
  );

  // Clear cart
  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      await clearCartMutation().unwrap();
      dispatch(
        showNotification({
          type: 'info',
          message: 'Cart cleared',
        })
      );
      return true;
    } catch (error) {
      dispatch(
        showNotification({
          type: 'error',
          message: 'Failed to clear cart',
        })
      );
      return false;
    }
  }, [clearCartMutation, dispatch, isAuthenticated]);

  // Refresh cart data
  const refreshCart = useCallback(() => {
    if (isAuthenticated) {
      refetch();
    }
  }, [refetch, isAuthenticated]);

  return {
    items,
    totalItems,
    totalPrice,
    isEmpty,
    addToCart,
    updateItemQuantity,
    removeItem,
    clearCart,
    refreshCart,
    isLoading: isAddLoading || isUpdateLoading || isRemoveLoading || isClearLoading,
  };
};
