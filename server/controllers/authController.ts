import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User"; // Mongoose model

// Generate JWT token
const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET as string;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(
    { id },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" } as jwt.SignOptions
  );
};

// Register a new user
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone, address } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      status: "fail",
      message: "User with that email already exists",
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    address,
    role: "user",
  });

  const token = generateToken(newUser._id.toString());

  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "strict",
  });

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    },
  });
});

// Login user
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide email and password",
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid credentials",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid credentials",
    });
  }

  const token = generateToken(user._id.toString());

  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "strict",
  });

  res.status(200).json({
    status: "success",
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// Get current user
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      status: "fail",
      message: "Not authenticated",
    });
  }

  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "User not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

// Logout user
export const logout = (req: Request, res: Response) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
  });
};
