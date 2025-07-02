import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

// ✅ CRA requires REACT_APP_ prefix for frontend env vars
const API_URL = import.meta.env.VITE_BACKEND_URL;

if (!API_URL) {
  throw new Error("Missing REACT_APP_BACKEND_URL environment variable");
} else {
  console.log("API URL:", API_URL);
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    // baseUrl: "http://localhost:5000/api", // Fallback for local development
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
    credentials: "include",
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
