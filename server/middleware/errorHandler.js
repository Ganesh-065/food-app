"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.asyncHandler = exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    /**
     * Global error handler for the application.
     *
     * Handles errors by responding with a JSON error response. The JSON error
     * response will contain the error status code, error message, and stack trace
     * if the NODE_ENV is set to 'development'.
     *
     * @function errorHandler
     * @param {Error} err - Error object
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next function
     */
    res./*************  ✨ Windsurf Command ⭐  *************/
/*******  1fe9e653-12ef-4800-b357-348bc349e2f1  *******/status(statusCode).json({
        status: 'error',
        statusCode,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};
exports.notFound = notFound;
