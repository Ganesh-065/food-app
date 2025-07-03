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
exports.logout = exports.getCurrentUser = exports.login = exports.register = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User")); // Mongoose model
// Generate JWT token
const generateToken = (id) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return jsonwebtoken_1.default.sign({ id }, secret, { expiresIn: process.env.JWT_EXPIRES_IN || "1d" });
};
// Register a new user
exports.register = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, phone, address } = req.body;
    const existingUser = yield User_1.default.findOne({ email });
    if (existingUser) {
        return res.status(400).json({
            status: "fail",
            message: "User with that email already exists",
        });
    }
    const salt = yield bcrypt_1.default.genSalt(10);
    const hashedPassword = yield bcrypt_1.default.hash(password, salt);
    const newUser = yield User_1.default.create({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        role: "user",
    });
    const token = generateToken(newUser._id.toString());
    res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "strict",
    });
    res.status(201).json({
        status: "success",
        token,
        data: {
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        },
    });
}));
// Login user
exports.login = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            status: "fail",
            message: "Please provide email and password",
        });
    }
    const user = yield User_1.default.findOne({ email });
    if (!user) {
        return res.status(401).json({
            status: "fail",
            message: "Invalid credentials",
        });
    }
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({
            status: "fail",
            message: "Invalid credentials",
        });
    }
    const token = generateToken(user._id.toString());
    res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "strict",
    });
    res.status(200).json({
        status: "success",
        token,
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        },
    });
}));
// Get current user
exports.getCurrentUser = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({
            status: "fail",
            message: "Not authenticated",
        });
    }
    const user = yield User_1.default.findById(req.user.id).select("-password");
    if (!user) {
        return res.status(404).json({
            status: "fail",
            message: "User not found",
        });
    }
    res.status(200).json({
        status: "success",
        data: { user },
    });
}));
// Logout user
const logout = (req, res) => {
    res.cookie("jwt", "loggedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({
        status: "success",
    });
};
exports.logout = logout;
