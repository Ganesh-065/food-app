"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkoutController_1 = require("../controllers/checkoutController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// All checkout routes require authentication
router.use(authMiddleware_1.protect);
// Create a new order
router.post('/', checkoutController_1.createOrder);
// Get all user orders
router.get('/orders', checkoutController_1.getUserOrders);
// Get a specific order
router.get('/orders/:id', checkoutController_1.getOrder);
exports.default = router;
