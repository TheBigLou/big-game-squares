import { Schema, model, Document, Types } from 'mongoose';

export interface IPlayer extends Document {
  gameId: string;
  name: string;
  email: string;
  joinedAt: Date;
}

const playerSchema = new Schema<IPlayer>({
  gameId: { 
    type: String, 
    required: true,
    index: true
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  joinedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Compound index to ensure unique email per game
playerSchema.index({ gameId: 1, email: 1 }, { unique: true });

export const Player = model<IPlayer>('Player', playerSchema); 