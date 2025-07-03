import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { Restaurant } from "../models/Restaurant";
import { MenuItem } from "../models/MenuItem";

// Get all restaurants with pagination and filters
export const getRestaurants = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 6;
  const skip = (page - 1) * limit;

  const filter: any = {};
  const sort: any = {};

  if (req.query.cuisine) {
    filter.cuisine = req.query.cuisine;
  }

  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search as string, "i");
    filter.$or = [
      { name: searchRegex },
      { cuisine: searchRegex }
    ];
  }

  if (req.query.sort === "rating") {
    sort.rating = -1;
  } else if (req.query.sort === "deliveryTime") {
    sort.deliveryTime = 1;
  }

  const total = await Restaurant.countDocuments(filter);
  const restaurants = await Restaurant.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const pagination: any = {
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  };

  if (skip + limit < total) {
    pagination.next = { page: page + 1, limit };
  }

  if (skip > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    status: "success",
    pagination,
    data: restaurants
  });
});

// Get a single restaurant by ID
export const getRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return res.status(404).json({
      status: "fail",
      message: "Restaurant not found"
    });
  }

  res.status(200).json({
    status: "success",
    data: restaurant
  });
});

// Get restaurant menu items by restaurant ID
export const getRestaurantMenu = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return res.status(404).json({
      status: "fail",
      message: "Restaurant not found"
    });
  }

  const menu = await MenuItem.find({ restaurantId: restaurant._id });

  res.status(200).json({
    status: "success",
    data: menu
  });
});

// Create a new restaurant
export const createRestaurant = asyncHandler(async (req: Request, res: Response) => {
try {
    const { name, cuisine, rating, deliveryTime, image, address, description, isOpen } = req.body;

  if (!name || !cuisine) {
    return res.status(400).json({
      status: "fail",
      message: "Name and cuisine are required"
    });
  }

  const restaurant = await Restaurant.create({
    name,
    cuisine,
    rating,
    deliveryTime,
    image,
    address,
    description,
    isOpen
  });

  res.status(201).json({
    status: "success",
    data: restaurant
  });
} catch (error) {
  console.error("Error creating restaurant:", error);
}
});

// Update a restaurant by ID
export const updateRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!restaurant) {
    return res.status(404).json({
      status: "fail",
      message: "Restaurant not found"
    });
  }

  res.status(200).json({
    status: "success",
    data: restaurant
  });
});

// Delete a restaurant by ID
export const deleteRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

  if (!restaurant) {
    return res.status(404).json({
      status: "fail",
      message: "Restaurant not found"
    });
  }

  // Optionally delete menu items associated with the restaurant
  await MenuItem.deleteMany({ restaurantId: restaurant._id });

  res.status(204).json({
    status: "success",
    data: null
  });
});
