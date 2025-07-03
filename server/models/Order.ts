import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
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

export const Order = mongoose.model('Order', orderSchema);
