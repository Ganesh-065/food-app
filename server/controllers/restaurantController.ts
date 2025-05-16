import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import fs from "fs";
import path from "path";

// Load mock data
const restaurants = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/restaurants.json"), "utf-8")
);

const menus = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/menus.json"), "utf-8")
);

// Get all restaurants with pagination
export const getRestaurants = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("hey");
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      // Filter by cuisine if provided
      const cuisine = req.query.cuisine as string;
      let filteredRestaurants = [...restaurants];

      if (cuisine) {
        filteredRestaurants = filteredRestaurants.filter(
          (restaurant: any) => restaurant.cuisine === cuisine
        );
      }

      // Sort if provided
      const sort = req.query.sort as string;
      if (sort === "rating") {
        filteredRestaurants.sort((a: any, b: any) => b.rating - a.rating);
      } else if (sort === "deliveryTime") {
        filteredRestaurants.sort(
          (a: any, b: any) => a.deliveryTime - b.deliveryTime
        );
      }

      // Search by name if provided
      const search = req.query.search as string;
      if (search) {
        filteredRestaurants = filteredRestaurants.filter(
          (restaurant: any) =>
            restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
            restaurant.cuisine.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Paginate results
      const paginatedResults = filteredRestaurants.slice(startIndex, endIndex);

      const pagination: any = {
        total: filteredRestaurants.length,
        pages: Math.ceil(filteredRestaurants.length / limit),
        currentPage: page,
      };

      if (endIndex < filteredRestaurants.length) {
        pagination.next = {
          page: page + 1,
          limit,
        };
      }

      if (startIndex > 0) {
        pagination.prev = {
          page: page - 1,
          limit,
        };
      }

      console.log(
        "Filtered Restaurants:",
        filteredRestaurants,
        paginatedResults
      );
      res.status(200).json({
        status: "success",
        pagination,
        data: paginatedResults,
      });
    } catch (error) {
      console.log("Error fetching restaurants:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  }
);

// Get a single restaurant
export const getRestaurant = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const restaurant = restaurants.find((r: any) => r.id === id);

    if (!restaurant) {
      res.status(404).json({
        status: "fail",
        message: "Restaurant not found",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      data: restaurant,
    });
  }
);

// Get restaurant menu
export const getRestaurantMenu = asyncHandler(
  async (req: Request, res: Response) => {
    const id: string = req.params.id || "";
    const restaurant = restaurants.find((r: any) => r.id === id);

    if (!restaurant) {
      res.status(404).json({
        status: "fail",
        message: "Restaurant not found",
      });
      return;
    }

    const menu = menus[id] || [];

    res.status(200).json({
      status: "success",
      data: menu,
    });
  }
);
