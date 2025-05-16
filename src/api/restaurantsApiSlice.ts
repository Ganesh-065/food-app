import { api } from "./apiSlice";

// Define types
export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: number;
  priceRange: string;
  image: string;
  address: string;
  description: string;
  isOpen: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular: boolean;
}

export interface RestaurantsResponse {
  status: string;
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    next?: {
      page: number;
      limit: number;
    };
    prev?: {
      page: number;
      limit: number;
    };
  };
  data: Restaurant[];
}

export interface RestaurantResponse {
  status: string;
  data: Restaurant;
}

export interface MenuResponse {
  status: string;
  data: MenuItem[];
}

// Define restaurant API endpoints
export const restaurantsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all restaurants with optional filters
    getRestaurants: builder.query<
      RestaurantsResponse,
      {
        page?: number;
        limit?: number;
        cuisine?: string | null;
        sort?: string | null;
        search?: string;
      }
    >({
      query: (params) => {
        const { page = 1, limit = 6, cuisine, sort, search } = params;
        let queryString = `restaurants?page=${page}&limit=${limit}`;

        if (cuisine) queryString += `&cuisine=${cuisine}`;
        if (sort) queryString += `&sort=${sort}`;
        if (search) queryString += `&search=${search}`;

        return queryString;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Restaurants" as const,
                id,
              })),
              { type: "Restaurants", id: "LIST" },
            ]
          : [{ type: "Restaurants", id: "LIST" }],
      keepUnusedDataFor: 60, // Cache for 60 seconds
    }),

    // Get a single restaurant by ID
    getRestaurantById: builder.query<RestaurantResponse, string>({
      query: (id) => `restaurants/${id}`,
      providesTags: (result, error, id) => [{ type: "Restaurant", id }],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Get restaurant menu
    getRestaurantMenu: builder.query<MenuResponse, string>({
      query: (id) => `restaurants/${id}/menu`,
      providesTags: (result, error, id) => [{ type: "Menu", id }],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),
  }),
  overrideExisting: false,
});

// Export auto-generated hooks
export const {
  useGetRestaurantsQuery,
  useGetRestaurantByIdQuery,
  useLazyGetRestaurantByIdQuery,
  useGetRestaurantMenuQuery,
} = restaurantsApi;
