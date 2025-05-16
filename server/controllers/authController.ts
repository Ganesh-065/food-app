// @ts-nocheck
import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Load mock data
const usersFilePath = path.join(__dirname, "../data/users.json");
let users = JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));

// Generate JWT token
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_jwt_secret", {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

// Register a new user
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone, address } = req.body;

  // Check if user already exists
  const userExists = users.find((user: any) => user.email === email);
  if (userExists) {
    res.status(400).json({
      status: "fail",
      message: "User with that email already exists",
    });
    return;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const newUser = {
    id: uuidv4(),
    name,
    email,
    password: hashedPassword,
    phone,
    address,
    role: "user",
  };

  // Add to mock database
  users.push(newUser);
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

  // Generate token
  const token = generateToken(newUser.id);

  // Set HTTP-only cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: "strict",
  });

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: {
        id: newUser.id,
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

  console.log(req.body, "123");

  // Check if email and password are provided
  if (!email || !password) {
    res.status(400).json({
      status: "fail",
      message: "Please provide email and password",
    });
    return;
  }

  // Find user in mock database
  const user = users.find((user: any) => user.email === email);
  if (!user) {
    res.status(401).json({
      status: "fail",
      message: "Invalid credentials",
    });
    return;
  }

  // Check if password is correct
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401).json({
      status: "fail",
      message: "Invalid credentials",
    });
    return;
  }

  // Generate token
  const token = generateToken(user.id);

  // Set HTTP-only cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: "strict",
  });

  res.status(200).json({
    status: "success",
    token,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// Get current user
export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        status: "fail",
        message: "Not authenticated",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
      },
    });
  }
);

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
