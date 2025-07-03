"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuItem = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const menuItemSchema = new mongoose_1.default.Schema({
    restaurantId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    image: String,
    category: String,
});
exports.MenuItem = mongoose_1.default.model("MenuItem", menuItemSchema);
