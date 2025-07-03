"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Restaurant = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const restaurantSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    cuisine: { type: String, required: true },
    rating: { type: Number, default: 0 },
    deliveryTime: { type: Number, required: true },
    image: { type: String },
    // Add other relevant fields as needed
});
exports.Restaurant = mongoose_1.default.model('Restaurant', restaurantSchema);
