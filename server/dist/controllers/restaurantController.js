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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRestaurantMenu = exports.getRestaurant = exports.getRestaurants = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Load mock data
const restaurants = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, '../data/restaurants.json'), 'utf-8'));
const menus = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, '../data/menus.json'), 'utf-8'));
// Get all restaurants with pagination
exports.getRestaurants = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    // Filter by cuisine if provided
    const cuisine = req.query.cuisine;
    let filteredRestaurants = [...restaurants];
    if (cuisine) {
        filteredRestaurants = filteredRestaurants.filter((restaurant) => restaurant.cuisine === cuisine);
    }
    // Sort if provided
    const sort = req.query.sort;
    if (sort === 'rating') {
        filteredRestaurants.sort((a, b) => b.rating - a.rating);
    }
    else if (sort === 'deliveryTime') {
        filteredRestaurants.sort((a, b) => a.deliveryTime - b.deliveryTime);
    }
    // Search by name if provided
    const search = req.query.search;
    if (search) {
        filteredRestaurants = filteredRestaurants.filter((restaurant) => restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
            restaurant.cuisine.toLowerCase().includes(search.toLowerCase()));
    }
    // Paginate results
    const paginatedResults = filteredRestaurants.slice(startIndex, endIndex);
    const pagination = {
        total: filteredRestaurants.length,
        pages: Math.ceil(filteredRestaurants.length / limit),
        currentPage: page
    };
    if (endIndex < filteredRestaurants.length) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }
    res.status(200).json({
        status: 'success',
        pagination,
        data: paginatedResults
    });
}));
// Get a single restaurant
exports.getRestaurant = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const restaurant = restaurants.find((r) => r.id === id);
    if (!restaurant) {
        res.status(404).json({
            status: 'fail',
            message: 'Restaurant not found'
        });
        return;
    }
    res.status(200).json({
        status: 'success',
        data: restaurant
    });
}));
// Get restaurant menu
exports.getRestaurantMenu = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id || '';
    const restaurant = restaurants.find((r) => r.id === id);
    if (!restaurant) {
        res.status(404).json({
            status: 'fail',
            message: 'Restaurant not found'
        });
        return;
    }
    const menu = menus[id] || [];
    res.status(200).json({
        status: 'success',
        data: menu
    });
}));
