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
exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
// Path to store cart data (in a real app, this would be in a database)
const cartFilePath = path_1.default.join(__dirname, '../data/carts.json');
// Initialize carts file if it doesn't exist
if (!fs_1.default.existsSync(cartFilePath)) {
    fs_1.default.writeFileSync(cartFilePath, JSON.stringify({}), 'utf-8');
}
// Load menus data for item details
const menusData = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, '../data/menus.json'), 'utf-8'));
// Helper function to load carts
const loadCarts = () => {
    try {
        const data = fs_1.default.readFileSync(cartFilePath, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        // If file doesn't exist or is corrupt, return empty object
        return {};
    }
};
// Helper function to save carts
const saveCarts = (carts) => {
    fs_1.default.writeFileSync(cartFilePath, JSON.stringify(carts, null, 2), 'utf-8');
};
// Get user's cart
exports.getCart = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({
            status: 'fail',
            message: 'Please log in to access your cart'
        });
        return;
    }
    const userId = req.user.id;
    const carts = loadCarts();
    // If user doesn't have a cart yet, create an empty one
    if (!carts[userId]) {
        carts[userId] = {
            id: (0, uuid_1.v4)(),
            userId,
            items: [],
            totalItems: 0,
            totalPrice: 0
        };
        saveCarts(carts);
    }
    res.status(200).json({
        status: 'success',
        data: carts[userId]
    });
}));
// Add item to cart
exports.addToCart = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({
            status: 'fail',
            message: 'Please log in to add items to your cart'
        });
        return;
    }
    const { restaurantId, itemId, quantity } = req.body;
    if (!restaurantId || !itemId || !quantity) {
        res.status(400).json({
            status: 'fail',
            message: 'Please provide restaurantId, itemId, and quantity'
        });
        return;
    }
    // Find item in menus
    const menu = menusData[restaurantId];
    if (!menu) {
        res.status(404).json({
            status: 'fail',
            message: 'Restaurant not found'
        });
        return;
    }
    const menuItem = menu.find((item) => item.id === itemId);
    if (!menuItem) {
        res.status(404).json({
            status: 'fail',
            message: 'Menu item not found'
        });
        return;
    }
    const userId = req.user.id;
    const carts = loadCarts();
    // If user doesn't have a cart yet, create one
    if (!carts[userId]) {
        carts[userId] = {
            id: (0, uuid_1.v4)(),
            userId,
            items: [],
            totalItems: 0,
            totalPrice: 0
        };
    }
    const cart = carts[userId];
    // Check if item from the same restaurant
    if (cart.items.length > 0) {
        const existingRestaurantId = cart.items[0].restaurantId;
        if (existingRestaurantId !== restaurantId) {
            res.status(400).json({
                status: 'fail',
                message: 'Cannot add items from different restaurants to the same cart'
            });
            return;
        }
    }
    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex((item) => item.id === itemId);
    if (existingItemIndex !== -1) {
        // Update quantity if item already exists
        cart.items[existingItemIndex].quantity += quantity;
    }
    else {
        // Add new item
        cart.items.push({
            id: itemId,
            restaurantId,
            name: menuItem.name,
            price: menuItem.price,
            image: menuItem.image,
            quantity
        });
    }
    // Update cart totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    // Save updated carts
    saveCarts(carts);
    res.status(200).json({
        status: 'success',
        data: cart
    });
}));
// Update cart item quantity
exports.updateCartItem = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({
            status: 'fail',
            message: 'Please log in to update your cart'
        });
        return;
    }
    const { itemId, quantity } = req.body;
    if (!itemId || quantity === undefined) {
        res.status(400).json({
            status: 'fail',
            message: 'Please provide itemId and quantity'
        });
        return;
    }
    const userId = req.user.id;
    const carts = loadCarts();
    // Check if user has a cart
    if (!carts[userId]) {
        res.status(404).json({
            status: 'fail',
            message: 'Cart not found'
        });
        return;
    }
    const cart = carts[userId];
    // Find item in cart
    const itemIndex = cart.items.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) {
        res.status(404).json({
            status: 'fail',
            message: 'Item not found in cart'
        });
        return;
    }
    if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cart.items.splice(itemIndex, 1);
    }
    else {
        // Update quantity
        cart.items[itemIndex].quantity = quantity;
    }
    // Update cart totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    // Save updated carts
    saveCarts(carts);
    res.status(200).json({
        status: 'success',
        data: cart
    });
}));
// Remove item from cart
exports.removeFromCart = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({
            status: 'fail',
            message: 'Please log in to update your cart'
        });
        return;
    }
    const { itemId } = req.params;
    if (!itemId) {
        res.status(400).json({
            status: 'fail',
            message: 'Please provide itemId'
        });
        return;
    }
    const userId = req.user.id;
    const carts = loadCarts();
    // Check if user has a cart
    if (!carts[userId]) {
        res.status(404).json({
            status: 'fail',
            message: 'Cart not found'
        });
        return;
    }
    const cart = carts[userId];
    // Find item in cart
    const itemIndex = cart.items.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) {
        res.status(404).json({
            status: 'fail',
            message: 'Item not found in cart'
        });
        return;
    }
    // Remove item
    cart.items.splice(itemIndex, 1);
    // Update cart totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    // Save updated carts
    saveCarts(carts);
    res.status(200).json({
        status: 'success',
        data: cart
    });
}));
// Clear cart
exports.clearCart = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({
            status: 'fail',
            message: 'Please log in to clear your cart'
        });
        return;
    }
    const userId = req.user.id;
    const carts = loadCarts();
    // Check if user has a cart
    if (!carts[userId]) {
        res.status(404).json({
            status: 'fail',
            message: 'Cart not found'
        });
        return;
    }
    // Reset cart
    carts[userId] = {
        id: carts[userId].id,
        userId,
        items: [],
        totalItems: 0,
        totalPrice: 0
    };
    // Save updated carts
    saveCarts(carts);
    res.status(200).json({
        status: 'success',
        data: carts[userId]
    });
}));
