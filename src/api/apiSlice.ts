import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

// Define base API slice
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    // baseUrl: "https://food-app-1-90z2.onrender.com/api",
    prepareHeaders: (headers, { getState }) => {
      // Get token from auth state
      const token = (getState() as RootState).auth.token;

      // If token exists, add authorization header
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
    credentials: "include", // Include cookies in requests
  }),
  tagTypes: [
    "Restaurants",
    "Restaurant",
    "Menu",
    "Cart",
    "User",
    "Reviews",
    "Orders",
  ],
  endpoints: () => ({}),
});

// Export hooks and reducer
export const {
  reducer: apiReducer,
  middleware: apiMiddleware,
  util: { resetApiState },
} = api;
