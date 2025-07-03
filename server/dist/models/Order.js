"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const orderSchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true },
    restaurantId: { type: String, required: true },
    items: [
        {
            restaurantId: String,
            name: String,
            quantity: Number,
            price: Number,
            image: String
        }
    ],
    totalItems: Number,
    totalPrice: Number,
    paymentMethod: String,
    deliveryAddress: String,
    status: { type: String, default: 'pending' },
    estimatedDeliveryTime: { type: Number, default: 30 }
}, { timestamps: true });
exports.Order = mongoose_1.default.model('Order', orderSchema);
