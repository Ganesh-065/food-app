import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Path to store orders data
const ordersFilePath = path.join(__dirname, '../data/orders.json');

// Initialize orders file if it doesn't exist
if (!fs.existsSync(ordersFilePath)) {
  fs.writeFileSync(ordersFilePath, JSON.stringify([]), 'utf-8');
}

// Path to cart data
const cartFilePath = path.join(__dirname, '../data/carts.json');

// Helper function to load carts
const loadCarts = () => {
  try {
    const data = fs.readFileSync(cartFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
};

// Helper function to save carts
const saveCarts = (carts: any) => {
  fs.writeFileSync(cartFilePath, JSON.stringify(carts, null, 2), 'utf-8');
};

// Helper function to load orders
const loadOrders = () => {
  try {
    const data = fs.readFileSync(ordersFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Helper function to save orders
const saveOrders = (orders: any) => {
  fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf-8');
};

// Create a new order
export const createOrder = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        status: 'fail',
        message: 'Please log in to checkout'
      });
      return;
    }

    const { paymentMethod, deliveryAddress } = req.body;

    if (!paymentMethod || !deliveryAddress) {
      res.status(400).json({
        status: 'fail',
        message: 'Please provide payment method and delivery address'
      });
      return;
    }

    const userId = req.user.id;
    const carts = loadCarts();

    // Check if user has a cart
    if (!carts[userId] || !carts[userId].items || carts[userId].items.length === 0) {
      res.status(400).json({
        status: 'fail',
        message: 'Your cart is empty'
      });
      return;
    }

    const cart = carts[userId];
    const restaurantId = cart.items[0].restaurantId;

    // Create new order
    const newOrder = {
      id: uuidv4(),
      userId,
      restaurantId,
      items: cart.items,
      totalItems: cart.totalItems,
      totalPrice: cart.totalPrice,
      paymentMethod,
      deliveryAddress,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedDeliveryTime: 30 // minutes
    };

    // Add order to orders database
    const orders = loadOrders();
    orders.push(newOrder);
    saveOrders(orders);

    // Clear user's cart
    carts[userId] = {
      id: cart.id,
      userId,
      items: [],
      totalItems: 0,
      totalPrice: 0
    };
    saveCarts(carts);

    res.status(201).json({
      status: 'success',
      data: newOrder
    });
  }
);

// Get user's orders
export const getUserOrders = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        status: 'fail',
        message: 'Please log in to view your orders'
      });
      return;
    }

    const userId = req.user.id;
    const orders = loadOrders();

    // Filter orders for current user
    const userOrders = orders.filter((order: any) => order.userId === userId);

    // Sort by creation date (newest first)
    userOrders.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.status(200).json({
      status: 'success',
      results: userOrders.length,
      data: userOrders
    });
  }
);

// Get a specific order
export const getOrder = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        status: 'fail',
        message: 'Please log in to view this order'
      });
      return;
    }

    const orderId = req.params.id;
    const orders = loadOrders();

    // Find specific order
    const order = orders.find((order: any) => order.id === orderId);

    if (!order) {
      res.status(404).json({
        status: 'fail',
        message: 'Order not found'
      });
      return;
    }

    // Check if order belongs to user
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to view this order'
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: order
    });
  }
);
