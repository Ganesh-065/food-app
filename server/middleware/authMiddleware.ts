import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler } from './errorHandler';
import fs from 'fs';
import path from 'path';

// Get users from mock data
const usersData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf-8')
);

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    // Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Or from cookie
    else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.',
      });
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback_jwt_secret'
      ) as DecodedToken;

      // Get user from mock data
      const currentUser = usersData.find((user: any) => user.id === decoded.id);

      if (!currentUser) {
        res.status(401).json({
          status: 'fail',
          message: 'The user belonging to this token no longer exists.',
        });
        return;
      }

      // Add user to request object
      req.user = currentUser;
      next();
    } catch (error) {
      res.status(401).json({
        status: 'fail',
        message: 'Invalid token or expired. Please log in again.',
      });
    }
  }
);

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action',
      });
      return;
    }

    next();
  };
};
