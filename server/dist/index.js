"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = require("dotenv");
// Routes
const restaurants_1 = __importDefault(require("./routes/restaurants"));
const auth_1 = __importDefault(require("./routes/auth"));
const cart_1 = __importDefault(require("./routes/cart"));
const checkout_1 = __importDefault(require("./routes/checkout"));
const reviews_1 = __importDefault(require("./routes/reviews"));
// Middleware
const errorHandler_1 = require("./middleware/errorHandler");
// Load environment variables
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('dev'));
// API Routes
app.use('/api/restaurants', restaurants_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/cart', cart_1.default);
app.use('/api/checkout', checkout_1.default);
app.use('/api/reviews', reviews_1.default);
// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Server is running' });
});
// Error handler
app.use(errorHandler_1.errorHandler);
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
