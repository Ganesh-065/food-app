"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Register a new user
router.post('/register', authController_1.register);
// Login user
router.post('/login', authController_1.login);
// Get current user
router.get('/me', authMiddleware_1.protect, authController_1.getCurrentUser);
// Logout user
router.get('/logout', authController_1.logout);
exports.default = router;
