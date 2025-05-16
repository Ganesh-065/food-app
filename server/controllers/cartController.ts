import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Path to store cart data (in a real app, this would be in a database)
const cartFilePath = path.join(__dirname, '../data/carts.json');

// Initialize carts file if it doesn't exist
if (!fs.existsSync(cartFilePath)) {
  fs.writeFileSync(cartFilePath, JSON.stringify({}), 'utf-8');
}

// Load menus data for item details
const menusData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/menus.json'), 'utf-8')
);

// Helper function to load carts
const loadCarts = () => {
  try {
    const data = fs.readFileSync(cartFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is corrupt, return empty object
    return {};
  }
};

// Helper function to save carts
const saveCarts = (carts: any) => {
  fs.writeFileSync(cartFilePath, JSON.stringify(carts, null, 2), 'utf-8');
};

// Get user's cart
export const getCart = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        status: 'fail',
        message: 'Please log in to access your cart'
      });
      return;
    }

    const userId = req.user.id;
    const carts = loadCarts();

    // If user doesn't have a cart yet, create an empty one
    if (!carts[userId]) {
      carts[userId] = {
        id: uuidv4(),
        userId,
        items: [],
        totalItems: 0,
        totalPrice: 0
      };
      saveCarts(carts);
    }

    res.status(200).json({
      status: 'success',
      data: carts[userId]
    });
  }
);

// Add item to cart
export const addToCart = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        status: 'fail',
        message: 'Please log in to add items to your cart'
      });
      return;
    }

    const { restaurantId, itemId, quantity } = req.body;

    if (!restaurantId || !itemId || !quantity) {
      res.status(400).json({
        status: 'fail',
        message: 'Please provide restaurantId, itemId, and quantity'
      });
      return;
    }

    // Find item in menus
    const menu = menusData[restaurantId];
    if (!menu) {
      res.status(404).json({
        status: 'fail',
        message: 'Restaurant not found'
      });
      return;
    }

    const menuItem = menu.find((item: any) => item.id === itemId);
    if (!menuItem) {
      res.status(404).json({
        status: 'fail',
        message: 'Menu item not found'
      });
      return;
    }

    const userId = req.user.id;
    const carts = loadCarts();

    // If user doesn't have a cart yet, create one
    if (!carts[userId]) {
      carts[userId] = {
        id: uuidv4(),
        userId,
        items: [],
        totalItems: 0,
        totalPrice: 0
      };
    }

    const cart = carts[userId];

    // Check if item from the same restaurant
    if (cart.items.length > 0) {
      const existingRestaurantId = cart.items[0].restaurantId;
      if (existingRestaurantId !== restaurantId) {
        res.status(400).json({
          status: 'fail',
          message: 'Cannot add items from different restaurants to the same cart'
        });
        return;
      }
    }

    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.id === itemId
    );

    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        id: itemId,
        restaurantId,
        name: menuItem.name,
        price: menuItem.price,
        image: menuItem.image,
        quantity
      });
    }

    // Update cart totals
    cart.totalItems = cart.items.reduce(
      (total: number, item: any) => total + item.quantity, 0
    );

    cart.totalPrice = cart.items.reduce(
      (total: number, item: any) => total + (item.price * item.quantity), 0
    );

    // Save updated carts
    saveCarts(carts);

    res.status(200).json({
      status: 'success',
      data: cart
    });
  }
);

// Update cart item quantity
export const updateCartItem = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        status: 'fail',
        message: 'Please log in to update your cart'
      });
      return;
    }

    const { itemId, quantity } = req.body;

    if (!itemId || quantity === undefined) {
      res.status(400).json({
        status: 'fail',
        message: 'Please provide itemId and quantity'
      });
      return;
    }

    const userId = req.user.id;
    const carts = loadCarts();

    // Check if user has a cart
    if (!carts[userId]) {
      res.status(404).json({
        status: 'fail',
        message: 'Cart not found'
      });
      return;
    }

    const cart = carts[userId];

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item: any) => item.id === itemId
    );

    if (itemIndex === -1) {
      res.status(404).json({
        status: 'fail',
        message: 'Item not found in cart'
      });
      return;
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    // Update cart totals
    cart.totalItems = cart.items.reduce(
      (total: number, item: any) => total + item.quantity, 0
    );

    cart.totalPrice = cart.items.reduce(
      (total: number, item: any) => total + (item.price * item.quantity), 0
    );

    // Save updated carts
    saveCarts(carts);

    res.status(200).json({
      status: 'success',
      data: cart
    });
  }
);

// Remove item from cart
export const removeFromCart = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        status: 'fail',
        message: 'Please log in to update your cart'
      });
      return;
    }

    const { itemId } = req.params;

    if (!itemId) {
      res.status(400).json({
        status: 'fail',
        message: 'Please provide itemId'
      });
      return;
    }

    const userId = req.user.id;
    const carts = loadCarts();

    // Check if user has a cart
    if (!carts[userId]) {
      res.status(404).json({
        status: 'fail',
        message: 'Cart not found'
      });
      return;
    }

    const cart = carts[userId];

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item: any) => item.id === itemId
    );

    if (itemIndex === -1) {
      res.status(404).json({
        status: 'fail',
        message: 'Item not found in cart'
      });
      return;
    }

    // Remove item
    cart.items.splice(itemIndex, 1);

    // Update cart totals
    cart.totalItems = cart.items.reduce(
      (total: number, item: any) => total + item.quantity, 0
    );

    cart.totalPrice = cart.items.reduce(
      (total: number, item: any) => total + (item.price * item.quantity), 0
    );

    // Save updated carts
    saveCarts(carts);

    res.status(200).json({
      status: 'success',
      data: cart
    });
  }
);

// Clear cart
export const clearCart = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        status: 'fail',
        message: 'Please log in to clear your cart'
      });
      return;
    }

    const userId = req.user.id;
    const carts = loadCarts();

    // Check if user has a cart
    if (!carts[userId]) {
      res.status(404).json({
        status: 'fail',
        message: 'Cart not found'
      });
      return;
    }

    // Reset cart
    carts[userId] = {
      id: carts[userId].id,
      userId,
      items: [],
      totalItems: 0,
      totalPrice: 0
    };

    // Save updated carts
    saveCarts(carts);

    res.status(200).json({
      status: 'success',
      data: carts[userId]
    });
  }
);
