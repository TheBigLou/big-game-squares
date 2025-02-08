"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwBadRequest = exports.throwUnauthorized = exports.throwNotFound = exports.handleError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500, code) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
const handleError = (error, res) => {
    console.error('Error:', error);
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            error: error.message,
            code: error.code
        });
    }
    if (error instanceof Error) {
        return res.status(500).json({
            error: error.message || 'Internal server error'
        });
    }
    return res.status(500).json({
        error: 'An unexpected error occurred'
    });
};
exports.handleError = handleError;
const throwNotFound = (message = 'Resource not found') => {
    throw new AppError(message, 404, 'NOT_FOUND');
};
exports.throwNotFound = throwNotFound;
const throwUnauthorized = (message = 'Unauthorized') => {
    throw new AppError(message, 403, 'UNAUTHORIZED');
};
exports.throwUnauthorized = throwUnauthorized;
const throwBadRequest = (message = 'Bad request') => {
    throw new AppError(message, 400, 'BAD_REQUEST');
};
exports.throwBadRequest = throwBadRequest;
