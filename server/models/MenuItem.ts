import mongoose from "mongoose";

interface IMenuItem {
  restaurantId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category?: string;
  isPopular?: boolean;
}

const menuItemSchema = new mongoose.Schema<IMenuItem>({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  image: String,
  category: String,
  isPopular: { type: Boolean, default: false }
});

export const MenuItem = mongoose.model<IMenuItem>("MenuItem", menuItemSchema);
