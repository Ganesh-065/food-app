import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';
import Cart from '../models/Cart';
import { Order } from '../models/Order';

// Create a new order
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'fail',
      message: 'Please log in to checkout'
    });
  }

  const { paymentMethod, deliveryAddress } = req.body;
  if (!paymentMethod || !deliveryAddress) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide payment method and delivery address'
    });
  }

  const userId = req.user.id;
  const cart = await Cart.findOne({ userId });

  if (!cart || !cart.items || cart.items.length === 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Your cart is empty'
    });
  }

  const restaurantId = cart.items[0].restaurantId;

  const newOrder = await Order.create({
    userId,
    restaurantId,
    items: cart.items,
    totalItems: cart.totalItems,
    totalPrice: cart.totalPrice,
    paymentMethod,
    deliveryAddress,
    estimatedDeliveryTime: 30
  });

  // Clear cart
  cart.set('items', []);
  cart.totalItems = 0;
  cart.totalPrice = 0;
  await cart.save();

  res.status(201).json({
    status: 'success',
    data: newOrder
  });
});

// Get all orders for current user
export const getUserOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'fail',
      message: 'Please log in to view your orders'
    });
  }

  const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: orders
  });
});

// Get a single order by ID
export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'fail',
      message: 'Please log in to view this order'
    });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      status: 'fail',
      message: 'Order not found'
    });
  }

  if (order.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'fail',
      message: 'You are not authorized to view this order'
    });
  }

  res.status(200).json({
    status: 'success',
    data: order
  });
});
