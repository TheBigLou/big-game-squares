import { Schema, model, Document } from 'mongoose';

interface ScoringConfig {
  firstQuarter: number;
  secondQuarter: number;
  thirdQuarter: number;
  final: number;
}

interface Score {
  vertical: number;
  horizontal: number;
}

interface GameScores {
  firstQuarter?: Score;
  secondQuarter?: Score;
  thirdQuarter?: Score;
  final?: Score;
  current: Score;
}

export interface IGame extends Document {
  gameId: string;
  ownerEmail: string;
  name: string;
  status: 'setup' | 'active' | 'completed';
  config: {
    squareCost: number;
    squareLimit: number;
    scoring: {
      firstQuarter: number;
      secondQuarter: number;
      thirdQuarter: number;
      final: number;
    };
    teams: {
      vertical: string;
      horizontal: string;
    };
  };
  grid: {
    rows: number[];
    cols: number[];
    final?: {
      rows: number[];
      cols: number[];
    };
  };
  scores: GameScores;
  currentQuarter: keyof GameScores;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

const gameSchema = new Schema<IGame>({
  gameId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  ownerEmail: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['setup', 'active', 'completed'],
    default: 'setup'
  },
  config: {
    squareCost: { 
      type: Number,
      default: 0,
      min: 0
    },
    squareLimit: { 
      type: Number,
      default: 100,
      min: 1,
      max: 100
    },
    scoring: {
      firstQuarter: { type: Number, default: 25 },
      secondQuarter: { type: Number, default: 25 },
      thirdQuarter: { type: Number, default: 25 },
      final: { type: Number, default: 25 }
    },
    teams: {
      vertical: { type: String, default: 'Team 1' },
      horizontal: { type: String, default: 'Team 2' }
    }
  },
  grid: {
    rows: [{ type: Number }],
    cols: [{ type: Number }],
    final: {
      rows: [{ type: Number }],
      cols: [{ type: Number }]
    }
  },
  scores: {
    current: {
      vertical: { type: Number, default: 0 },
      horizontal: { type: Number, default: 0 }
    },
    firstQuarter: {
      vertical: { type: Number },
      horizontal: { type: Number }
    },
    secondQuarter: {
      vertical: { type: Number },
      horizontal: { type: Number }
    },
    thirdQuarter: {
      vertical: { type: Number },
      horizontal: { type: Number }
    },
    final: {
      vertical: { type: Number },
      horizontal: { type: Number }
    }
  },
  currentQuarter: {
    type: String,
    enum: ['firstQuarter', 'secondQuarter', 'thirdQuarter', 'final'],
    default: 'firstQuarter'
  },
  createdAt: { 
    type: Date,
    default: Date.now 
  },
  startedAt: Date,
  completedAt: Date
});

export const Game = model<IGame>('Game', gameSchema); 