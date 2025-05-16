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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
// Load mock data
const usersFilePath = path_1.default.join(__dirname, '../data/users.json');
let users = JSON.parse(fs_1.default.readFileSync(usersFilePath, 'utf-8'));
// Generate JWT token
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET || 'fallback_jwt_secret', {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });
};
// Register a new user
exports.register = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, phone, address } = req.body;
    // Check if user already exists
    const userExists = users.find((user) => user.email === email);
    if (userExists) {
        res.status(400).json({
            status: 'fail',
            message: 'User with that email already exists'
        });
        return;
    }
    // Hash password
    const salt = yield bcrypt_1.default.genSalt(10);
    const hashedPassword = yield bcrypt_1.default.hash(password, salt);
    // Create new user
    const newUser = {
        id: (0, uuid_1.v4)(),
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        role: 'user'
    };
    // Add to mock database
    users.push(newUser);
    fs_1.default.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    // Generate token
    const token = generateToken(newUser.id);
    // Set HTTP-only cookie
    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: 'strict'
    });
    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        }
    });
}));
// Login user
exports.login = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // Check if email and password are provided
    if (!email || !password) {
        res.status(400).json({
            status: 'fail',
            message: 'Please provide email and password'
        });
        return;
    }
    // Find user in mock database
    const user = users.find((user) => user.email === email);
    if (!user) {
        res.status(401).json({
            status: 'fail',
            message: 'Invalid credentials'
        });
        return;
    }
    // Check if password is correct
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        res.status(401).json({
            status: 'fail',
            message: 'Invalid credentials'
        });
        return;
    }
    // Generate token
    const token = generateToken(user.id);
    // Set HTTP-only cookie
    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: 'strict'
    });
    res.status(200).json({
        status: 'success',
        token,
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }
    });
}));
// Get current user
exports.getCurrentUser = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({
            status: 'fail',
            message: 'Not authenticated'
        });
        return;
    }
    res.status(200).json({
        status: 'success',
        data: {
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        }
    });
}));
// Logout user
const logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    });
};
exports.logout = logout;
