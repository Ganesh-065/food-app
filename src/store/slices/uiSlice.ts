import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Define UI state
interface UiState {
  isLoading: boolean;
  notification: {
    type: 'info' | 'success' | 'warning' | 'error' | null;
    message: string | null;
    visible: boolean;
  };
  mobileMenuOpen: boolean;
  searchQuery: string;
  filters: {
    cuisine: string | null;
    sort: 'rating' | 'deliveryTime' | null;
  };
}

// Initial state
const initialState: UiState = {
  isLoading: false,
  notification: {
    type: null,
    message: null,
    visible: false,
  },
  mobileMenuOpen: false,
  searchQuery: '',
  filters: {
    cuisine: null,
    sort: null,
  },
};

// Create UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    showNotification: (
      state,
      action: PayloadAction<{ type: 'info' | 'success' | 'warning' | 'error'; message: string }>
    ) => {
      state.notification.type = action.payload.type;
      state.notification.message = action.payload.message;
      state.notification.visible = true;
    },

    hideNotification: (state) => {
      state.notification.visible = false;
    },

    clearNotification: (state) => {
      state.notification.type = null;
      state.notification.message = null;
      state.notification.visible = false;
    },

    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },

    closeMobileMenu: (state) => {
      state.mobileMenuOpen = false;
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    setCuisineFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.cuisine = action.payload;
    },

    setSortFilter: (state, action: PayloadAction<'rating' | 'deliveryTime' | null>) => {
      state.filters.sort = action.payload;
    },

    clearFilters: (state) => {
      state.filters.cuisine = null;
      state.filters.sort = null;
    },
  },
});

// Export actions and selectors
export const {
  setLoading,
  showNotification,
  hideNotification,
  clearNotification,
  toggleMobileMenu,
  closeMobileMenu,
  setSearchQuery,
  setCuisineFilter,
  setSortFilter,
  clearFilters,
} = uiSlice.actions;

export const selectIsLoading = (state: RootState) => state.ui.isLoading;
export const selectNotification = (state: RootState) => state.ui.notification;
export const selectMobileMenuOpen = (state: RootState) => state.ui.mobileMenuOpen;
export const selectSearchQuery = (state: RootState) => state.ui.searchQuery;
export const selectFilters = (state: RootState) => state.ui.filters;

export default uiSlice.reducer;
