export interface Score {
  vertical: number;
  horizontal: number;
}

export interface GameScores {
  current: Score;
  firstQuarter?: Score;
  secondQuarter?: Score;
  thirdQuarter?: Score;
  final?: Score;
}

export interface GameConfig {
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
}

export interface Grid {
  rows: number[];
  cols: number[];
  final?: {
    rows: number[];
    cols: number[];
  };
}

export type GameStatus = 'setup' | 'active' | 'completed';
export type Quarter = 'firstQuarter' | 'secondQuarter' | 'thirdQuarter' | 'final';

export interface Game {
  gameId: string;
  ownerEmail: string;
  name: string;
  status: GameStatus;
  config: GameConfig;
  grid: Grid;
  scores: GameScores;
  currentQuarter: Quarter;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export const DEFAULT_SCORES: GameScores = {
  current: { vertical: 0, horizontal: 0 },
  firstQuarter: { vertical: 0, horizontal: 0 },
  secondQuarter: { vertical: 0, horizontal: 0 },
  thirdQuarter: { vertical: 0, horizontal: 0 },
  final: { vertical: 0, horizontal: 0 }
}; 