import { Request, Response, NextFunction } from 'express';
import { throwBadRequest } from '../utils/errorHandler';
import { Score, Quarter } from '../types/game';

export const validateScore = (score: unknown): score is Score => {
  if (!score || typeof score !== 'object') return false;
  const { vertical, horizontal } = score as Score;
  return (
    typeof vertical === 'number' && 
    typeof horizontal === 'number' &&
    !isNaN(vertical) && 
    !isNaN(horizontal)
  );
};

export const validateQuarter = (quarter: unknown): quarter is Quarter => {
  const validQuarters = ['firstQuarter', 'secondQuarter', 'thirdQuarter', 'final'];
  return typeof quarter === 'string' && validQuarters.includes(quarter);
};

export const validateUpdateScoreRequest = (req: Request, _res: Response, next: NextFunction) => {
  const { ownerEmail, quarter, score } = req.body;

  if (!ownerEmail || typeof ownerEmail !== 'string') {
    throwBadRequest('Owner email is required');
  }

  if (!validateQuarter(quarter)) {
    throwBadRequest('Invalid quarter');
  }

  if (!validateScore(score)) {
    throwBadRequest('Invalid score format');
  }

  next();
};

export const validateUpdateCurrentScoreRequest = (req: Request, _res: Response, next: NextFunction) => {
  const { ownerEmail, score } = req.body;

  if (!ownerEmail || typeof ownerEmail !== 'string') {
    throwBadRequest('Owner email is required');
  }

  if (!validateScore(score)) {
    throwBadRequest('Invalid score format');
  }

  next();
}; 