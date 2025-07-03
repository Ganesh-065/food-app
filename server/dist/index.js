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
const mongoose_1 = __importDefault(require("mongoose"));
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// CORS config for a single allowed frontend origin
// const allowedOrigin = "http://localhost:5173"; // Default to localhost for local development
const allowedOrigin = process.env.FRONTEND_URL || "https://food-app-liart-xi.vercel.app";
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    throw new Error("MONGO_URI is not defined in the environment variables.");
}
mongoose_1.default.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));
app.use((0, cors_1.default)({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Handle preflight OPTIONS requests globally
app.options("*", (0, cors_1.default)({
    origin: allowedOrigin,
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)("dev"));
// API Routes
app.use("/api/restaurants", restaurants_1.default);
app.use("/api/auth", auth_1.default);
app.use("/api/cart", cart_1.default);
app.use("/api/checkout", checkout_1.default);
app.use("/api/reviews", reviews_1.default);
// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "Server is running" });
});
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
