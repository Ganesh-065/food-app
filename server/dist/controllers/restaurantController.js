"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRestaurantMenu = exports.getRestaurant = exports.getRestaurants = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const Restaurant_1 = require("../models/Restaurant");
const MenuItem_1 = require("../models/MenuItem");
// Get all restaurants with pagination and filters
exports.getRestaurants = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;
    const filter = {};
    const sort = {};
    if (req.query.cuisine) {
        filter.cuisine = req.query.cuisine;
    }
    if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, "i");
        filter.$or = [
            { name: searchRegex },
            { cuisine: searchRegex }
        ];
    }
    if (req.query.sort === "rating") {
        sort.rating = -1;
    }
    else if (req.query.sort === "deliveryTime") {
        sort.deliveryTime = 1;
    }
    const total = yield Restaurant_1.Restaurant.countDocuments(filter);
    const restaurants = yield Restaurant_1.Restaurant.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);
    const pagination = {
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
}));
// Get a single restaurant by ID
exports.getRestaurant = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const restaurant = yield Restaurant_1.Restaurant.findById(req.params.id);
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
}));
// Get restaurant menu items by restaurant ID
exports.getRestaurantMenu = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const restaurant = yield Restaurant_1.Restaurant.findById(req.params.id);
    if (!restaurant) {
        return res.status(404).json({
            status: "fail",
            message: "Restaurant not found"
        });
    }
    const menu = yield MenuItem_1.MenuItem.find({ restaurantId: restaurant._id });
    res.status(200).json({
        status: "success",
        data: menu
    });
}));
