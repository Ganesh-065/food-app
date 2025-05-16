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
exports.restrictTo = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Get users from mock data
const usersData = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, '../data/users.json'), 'utf-8'));
exports.protect = (0, errorHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    // Get token from Authorization header
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Or from cookie
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        res.status(401).json({
            status: 'fail',
            message: 'You are not logged in. Please log in to get access.',
        });
        return;
    }
    try {
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret');
        // Get user from mock data
        const currentUser = usersData.find((user) => user.id === decoded.id);
        if (!currentUser) {
            res.status(401).json({
                status: 'fail',
                message: 'The user belonging to this token no longer exists.',
            });
            return;
        }
        // Add user to request object
        req.user = currentUser;
        next();
    }
    catch (error) {
        res.status(401).json({
            status: 'fail',
            message: 'Invalid token or expired. Please log in again.',
        });
    }
}));
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                status: 'fail',
                message: 'You are not logged in. Please log in to get access.',
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to perform this action',
            });
            return;
        }
        next();
    };
};
exports.restrictTo = restrictTo;
