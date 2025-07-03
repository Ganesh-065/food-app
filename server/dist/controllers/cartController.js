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
const Cart_1 = __importDefault(require("../models/Cart"));
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
        return res.status(401).json({ status: 'fail', message: 'Please log in to access your cart' });
    }
    const userId = req.user.id;
    let cart = yield Cart_1.default.findOne({ userId });
    if (!cart) {
        cart = yield Cart_1.default.create({
            userId,
            items: [],
            totalItems: 0,
            totalPrice: 0
        });
    }
    res.status(200).json({ status: 'success', data: cart });
}));
// Add item to cart
exports.addToCart = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ status: 'fail', message: 'Please log in to add items to your cart' });
    }
    const { restaurantId, itemId, quantity } = req.body;
    if (!restaurantId || !itemId || !quantity) {
        return res.status(400).json({ status: 'fail', message: 'Please provide restaurantId, itemId, and quantity' });
    }
    const menu = menusData[restaurantId];
    if (!menu) {
        return res.status(404).json({ status: 'fail', message: 'Restaurant not found' });
    }
    const menuItem = menu.find((item) => item.id === itemId);
    if (!menuItem) {
        return res.status(404).json({ status: 'fail', message: 'Menu item not found' });
    }
    const userId = req.user.id;
    let cart = yield Cart_1.default.findOne({ userId });
    if (!cart) {
        cart = new Cart_1.default({
            userId,
            items: [],
            totalItems: 0,
            totalPrice: 0
        });
    }
    if (cart.items.length > 0 && cart.items[0].restaurantId !== restaurantId) {
        return res.status(400).json({
            status: 'fail',
            message: 'Cannot add items from different restaurants to the same cart'
        });
    }
    const existingItem = cart.items.find((item) => item.id === itemId);
    if (existingItem) {
        existingItem.quantity += quantity;
    }
    else {
        cart.items.push({
            id: itemId,
            restaurantId,
            name: menuItem.name,
            price: menuItem.price,
            image: menuItem.image,
            quantity
        });
    }
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + item.quantity * item.price, 0);
    yield cart.save();
    res.status(200).json({ status: 'success', data: cart });
}));
// Update cart item quantity
exports.updateCartItem = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ status: 'fail', message: 'Please log in to update your cart' });
    }
    const { itemId, quantity } = req.body;
    if (!itemId || quantity === undefined) {
        return res.status(400).json({ status: 'fail', message: 'Please provide itemId and quantity' });
    }
    const cart = yield Cart_1.default.findOne({ userId: req.user.id });
    if (!cart) {
        return res.status(404).json({ status: 'fail', message: 'Cart not found' });
    }
    const item = cart.items.find((item) => item.id === itemId);
    if (!item) {
        return res.status(404).json({ status: 'fail', message: 'Item not found in cart' });
    }
    if (quantity <= 0) {
        cart.items = cart.items.filter((item) => item.id !== itemId);
    }
    else {
        item.quantity = quantity;
    }
    cart.totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    yield cart.save();
    res.status(200).json({ status: 'success', data: cart });
}));
// Remove item from cart
exports.removeFromCart = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ status: 'fail', message: 'Please log in to update your cart' });
    }
    const { itemId } = req.params;
    const cart = yield Cart_1.default.findOne({ userId: req.user.id });
    if (!cart) {
        return res.status(404).json({ status: 'fail', message: 'Cart not found' });
    }
    const itemExists = cart.items.some((item) => item.id === itemId);
    if (!itemExists) {
        return res.status(404).json({ status: 'fail', message: 'Item not found in cart' });
    }
    cart.items = cart.items.filter((item) => item.id !== itemId);
    cart.totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    yield cart.save();
    res.status(200).json({ status: 'success', data: cart });
}));
// Clear cart
exports.clearCart = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ status: 'fail', message: 'Please log in to clear your cart' });
    }
    const cart = yield Cart_1.default.findOne({ userId: req.user.id });
    if (!cart) {
        return res.status(404).json({ status: 'fail', message: 'Cart not found' });
    }
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    yield cart.save();
    res.status(200).json({ status: 'success', data: cart });
}));
