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
const Cart_1 = __importDefault(require("../models/Cart"));
const Order_1 = require("../models/Order");
// Create a new order
exports.createOrder = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({
            status: 'fail',
            message: 'Please log in to checkout'
        });
    }
    const { paymentMethod, deliveryAddress } = req.body;
    if (!paymentMethod || !deliveryAddress) {
        return res.status(400).json({
            status: 'fail',
            message: 'Please provide payment method and delivery address'
        });
    }
    const userId = req.user.id;
    const cart = yield Cart_1.default.findOne({ userId });
    if (!cart || !cart.items || cart.items.length === 0) {
        return res.status(400).json({
            status: 'fail',
            message: 'Your cart is empty'
        });
    }
    const restaurantId = cart.items[0].restaurantId;
    const newOrder = yield Order_1.Order.create({
        userId,
        restaurantId,
        items: cart.items,
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice,
        paymentMethod,
        deliveryAddress,
        estimatedDeliveryTime: 30
    });
    // Clear cart
    cart.set('items', []);
    cart.totalItems = 0;
    cart.totalPrice = 0;
    yield cart.save();
    res.status(201).json({
        status: 'success',
        data: newOrder
    });
}));
// Get all orders for current user
exports.getUserOrders = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({
            status: 'fail',
            message: 'Please log in to view your orders'
        });
    }
    const orders = yield Order_1.Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: orders
    });
}));
// Get a single order by ID
exports.getOrder = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({
            status: 'fail',
            message: 'Please log in to view this order'
        });
    }
    const order = yield Order_1.Order.findById(req.params.id);
    if (!order) {
        return res.status(404).json({
            status: 'fail',
            message: 'Order not found'
        });
    }
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            status: 'fail',
            message: 'You are not authorized to view this order'
        });
    }
    res.status(200).json({
        status: 'success',
        data: order
    });
}));
