import mongoose, { Schema, Document } from 'mongoose';

interface CartItem {
  id: string;
  restaurantId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface CartDocument extends Document {
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

const CartItemSchema = new Schema<CartItem>({
  id: { type: String, required: true },
  restaurantId: { type: String, required: true },
  name: String,
  price: Number,
  image: String,
  quantity: Number,
}, { _id: false });

const CartSchema = new Schema<CartDocument>({
  userId: { type: String, required: true, unique: true },
  items: [CartItemSchema],
  totalItems: Number,
  totalPrice: Number,
});

export default mongoose.model<CartDocument>('Cart', CartSchema);
