import { Response } from 'express';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown, res: Response) => {
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

export const throwNotFound = (message: string = 'Resource not found') => {
  throw new AppError(message, 404, 'NOT_FOUND');
};

export const throwUnauthorized = (message: string = 'Unauthorized') => {
  throw new AppError(message, 403, 'UNAUTHORIZED');
};

export const throwBadRequest = (message: string = 'Bad request') => {
  throw new AppError(message, 400, 'BAD_REQUEST');
}; 