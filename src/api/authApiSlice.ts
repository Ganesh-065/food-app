import { api } from './apiSlice';

// Define types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

// Define auth API endpoints
export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Login
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    // Register
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: 'auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Get current user
    getCurrentUser: builder.query<{ status: string; data: { user: User } }, void>({
      query: () => 'auth/me',
      providesTags: ['User'],
    }),

    // Logout
    logout: builder.mutation<{ status: string }, void>({
      query: () => ({
        url: 'auth/logout',
        method: 'GET',
      }),
      invalidatesTags: ['User', 'Cart'],
    }),
  }),
  overrideExisting: false,
});

// Export auto-generated hooks
export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useLogoutMutation,
} = authApi;
