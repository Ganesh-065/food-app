"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cartController_1 = require("../controllers/cartController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// All cart routes require authentication
router.use(authMiddleware_1.protect);
// Get the user's cart
router.get('/', cartController_1.getCart);
// Add item to cart
router.post('/add', cartController_1.addToCart);
// Update cart item quantity
router.put('/update', cartController_1.updateCartItem);
// Remove item from cart
router.delete('/remove/:itemId', cartController_1.removeFromCart);
// Clear cart
router.delete('/clear', cartController_1.clearCart);
exports.default = router;
