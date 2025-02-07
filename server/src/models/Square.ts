import { Schema, model, Document } from 'mongoose';

export interface ISquare extends Document {
  gameId: string;
  playerId: string;
  row: number;
  col: number;
  selectedAt: Date;
}

const squareSchema = new Schema<ISquare>({
  gameId: { 
    type: String, 
    required: true,
    index: true
  },
  playerId: { 
    type: String, 
    required: true,
    index: true
  },
  row: { 
    type: Number, 
    required: true,
    min: 0,
    max: 9
  },
  col: { 
    type: Number, 
    required: true,
    min: 0,
    max: 9
  },
  selectedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Compound index to ensure unique square per game
squareSchema.index({ gameId: 1, row: 1, col: 1 }, { unique: true });

// Compound index for quick lookups of player's squares
squareSchema.index({ gameId: 1, playerId: 1 });

export const Square = model<ISquare>('Square', squareSchema); 