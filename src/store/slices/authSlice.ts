import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../api/authApiSlice';
import { authApi } from '../../api/authApiSlice';
import { RootState } from '../index';

// Define auth state
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

// Create auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    // Handle login success
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        state.user = payload.data.user;
        state.token = payload.token;
        state.isAuthenticated = true;
      }
    );

    // Handle register success
    builder.addMatcher(
      authApi.endpoints.register.matchFulfilled,
      (state, { payload }) => {
        state.user = payload.data.user;
        state.token = payload.token;
        state.isAuthenticated = true;
      }
    );

    // Handle logout success
    builder.addMatcher(
      authApi.endpoints.logout.matchFulfilled,
      (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      }
    );
  },
});

// Export actions and selectors
export const { setCredentials, clearCredentials } = authSlice.actions;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

export default authSlice.reducer;
