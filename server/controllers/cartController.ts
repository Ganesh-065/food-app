import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Cart from '../models/Cart';

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
export const getCart = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ status: 'fail', message: 'Please log in to access your cart' });
  }

  const userId = req.user.id;
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({
      userId,
      items: [],
      totalItems: 0,
      totalPrice: 0
    });
  }

  res.status(200).json({ status: 'success', data: cart });
});

// Add item to cart
export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ status: 'fail', message: 'Please log in to add items to your cart' });
  }

  const { restaurantId, itemId, quantity } = req.body;

  if (!restaurantId || !itemId || !quantity) {
    return res.status(400).json({ status: 'fail', message: 'Please provide restaurantId, itemId, and quantity' });
  }

  const menu = menusData[restaurantId];
  if (!menu) {
    return res.status(404).json({ status: 'fail', message: 'Restaurant not found' });
  }

  const menuItem = menu.find((item: any) => item.id === itemId);
  if (!menuItem) {
    return res.status(404).json({ status: 'fail', message: 'Menu item not found' });
  }

  const userId = req.user.id;
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({
      userId,
      items: [],
      totalItems: 0,
      totalPrice: 0
    });
  }

  if (cart.items.length > 0 && cart.items[0].restaurantId !== restaurantId) {
    return res.status(400).json({
      status: 'fail',
      message: 'Cannot add items from different restaurants to the same cart'
    });
  }

  const existingItem = cart.items.find((item) => item.id === itemId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      id: itemId,
      restaurantId,
      name: menuItem.name,
      price: menuItem.price,
      image: menuItem.image,
      quantity
    });
  }

  cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
  cart.totalPrice = cart.items.reduce((total, item) => total + item.quantity * item.price, 0);

  await cart.save();

  res.status(200).json({ status: 'success', data: cart });
});

// Update cart item quantity
export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ status: 'fail', message: 'Please log in to update your cart' });
  }

  const { itemId, quantity } = req.body;
  if (!itemId || quantity === undefined) {
    return res.status(400).json({ status: 'fail', message: 'Please provide itemId and quantity' });
  }

  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) {
    return res.status(404).json({ status: 'fail', message: 'Cart not found' });
  }

  const item = cart.items.find((item) => item.id === itemId);
  if (!item) {
    return res.status(404).json({ status: 'fail', message: 'Item not found in cart' });
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter((item) => item.id !== itemId);
  } else {
    item.quantity = quantity;
  }

  cart.totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  cart.totalPrice = cart.items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  await cart.save();
  res.status(200).json({ status: 'success', data: cart });
});


// Remove item from cart
export const removeFromCart = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ status: 'fail', message: 'Please log in to update your cart' });
  }

  const { itemId } = req.params;
  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) {
    return res.status(404).json({ status: 'fail', message: 'Cart not found' });
  }

  const itemExists = cart.items.some((item) => item.id === itemId);
  if (!itemExists) {
    return res.status(404).json({ status: 'fail', message: 'Item not found in cart' });
  }

  cart.items = cart.items.filter((item) => item.id !== itemId);
  cart.totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  cart.totalPrice = cart.items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  await cart.save();
  res.status(200).json({ status: 'success', data: cart });
});


// Clear cart
export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ status: 'fail', message: 'Please log in to clear your cart' });
  }

  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) {
    return res.status(404).json({ status: 'fail', message: 'Cart not found' });
  }

  cart.items = [];
  cart.totalItems = 0;
  cart.totalPrice = 0;

  await cart.save();
  res.status(200).json({ status: 'success', data: cart });
});

