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
exports.getOrder = exports.getUserOrders = exports.createOrder = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
// Path to store orders data
const ordersFilePath = path_1.default.join(__dirname, '../data/orders.json');
// Initialize orders file if it doesn't exist
if (!fs_1.default.existsSync(ordersFilePath)) {
    fs_1.default.writeFileSync(ordersFilePath, JSON.stringify([]), 'utf-8');
}
// Path to cart data
const cartFilePath = path_1.default.join(__dirname, '../data/carts.json');
// Helper function to load carts
const loadCarts = () => {
    try {
        const data = fs_1.default.readFileSync(cartFilePath, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        return {};
    }
};
// Helper function to save carts
const saveCarts = (carts) => {
    fs_1.default.writeFileSync(cartFilePath, JSON.stringify(carts, null, 2), 'utf-8');
};
// Helper function to load orders
const loadOrders = () => {
    try {
        const data = fs_1.default.readFileSync(ordersFilePath, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        return [];
    }
};
// Helper function to save orders
const saveOrders = (orders) => {
    fs_1.default.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf-8');
};
// Create a new order
exports.createOrder = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({
            status: 'fail',
            message: 'Please log in to checkout'
        });
        return;
    }
    const { paymentMethod, deliveryAddress } = req.body;
    if (!paymentMethod || !deliveryAddress) {
        res.status(400).json({
            status: 'fail',
            message: 'Please provide payment method and delivery address'
        });
        return;
    }
    const userId = req.user.id;
    const carts = loadCarts();
    // Check if user has a cart
    if (!carts[userId] || !carts[userId].items || carts[userId].items.length === 0) {
        res.status(400).json({
            status: 'fail',
            message: 'Your cart is empty'
        });
        return;
    }
    const cart = carts[userId];
    const restaurantId = cart.items[0].restaurantId;
    // Create new order
    const newOrder = {
        id: (0, uuid_1.v4)(),
        userId,
        restaurantId,
        items: cart.items,
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice,
        paymentMethod,
        deliveryAddress,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedDeliveryTime: 30 // minutes
    };
    // Add order to orders database
    const orders = loadOrders();
    orders.push(newOrder);
    saveOrders(orders);
    // Clear user's cart
    carts[userId] = {
        id: cart.id,
        userId,
        items: [],
        totalItems: 0,
        totalPrice: 0
    };
    saveCarts(carts);
    res.status(201).json({
        status: 'success',
        data: newOrder
    });
}));
// Get user's orders
exports.getUserOrders = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({
            status: 'fail',
            message: 'Please log in to view your orders'
        });
        return;
    }
    const userId = req.user.id;
    const orders = loadOrders();
    // Filter orders for current user
    const userOrders = orders.filter((order) => order.userId === userId);
    // Sort by creation date (newest first)
    userOrders.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    res.status(200).json({
        status: 'success',
        results: userOrders.length,
        data: userOrders
    });
}));
// Get a specific order
exports.getOrder = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({
            status: 'fail',
            message: 'Please log in to view this order'
        });
        return;
    }
    const orderId = req.params.id;
    const orders = loadOrders();
    // Find specific order
    const order = orders.find((order) => order.id === orderId);
    if (!order) {
        res.status(404).json({
            status: 'fail',
            message: 'Order not found'
        });
        return;
    }
    // Check if order belongs to user
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({
            status: 'fail',
            message: 'You are not authorized to view this order'
        });
        return;
    }
    res.status(200).json({
        status: 'success',
        data: order
    });
}));
