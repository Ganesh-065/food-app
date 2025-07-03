import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cuisine: { type: String, required: true },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  deliveryTime: { type: Number, required: true }, // in minutes
  priceRange: {
    type: String,
    // enum: ['$', '$$', '$$$'],
    // default: '$$'
  },
  image: { type: String },
  address: { type: String, required: true },
  description: { type: String },
  isOpen: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const Restaurant = mongoose.model('Restaurant', restaurantSchema);
