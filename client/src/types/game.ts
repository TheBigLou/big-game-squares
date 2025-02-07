export interface Player {
  _id: string;
  name: string;
  email: string;
  gameId: string;
}

export interface Square {
  _id: string;
  gameId: string;
  playerId: string;
  row: number;
  col: number;
}

export interface Score {
  vertical: number;
  horizontal: number;
}

export interface GameScores {
  firstQuarter?: Score;
  secondQuarter?: Score;
  thirdQuarter?: Score;
  final?: Score;
  current: Score;
}

export interface GameConfig {
  teams: {
    vertical: string;
    horizontal: string;
  };
  scoring: {
    firstQuarter: number;
    secondQuarter: number;
    thirdQuarter: number;
    final: number;
  };
  squareLimit: number;
  squareCost: number;
}

export interface Game {
  _id: string;
  gameId: string;
  name: string;
  ownerEmail: string;
  status: 'setup' | 'active' | 'completed';
  config: GameConfig;
  grid?: {
    rows: number[];
    cols: number[];
  };
  scores?: GameScores;
}

export interface Payouts {
  firstQuarter: number;
  secondQuarter: number;
  thirdQuarter: number;
  final: number;
}

export interface GameData {
  game: Game;
  players: Player[];
  squares: Square[];
  prizePool: number;
  payouts: Payouts;
}

export interface PendingSquare {
  row: number;
  col: number;
}

export interface PendingSquareData extends PendingSquare {
  gameId: string;
  playerId: string;
  timestamp: number;
}

export interface EditScore {
  vertical: string;
  horizontal: string;
}

// State interfaces
export interface GameState {
  squares: {
    pending: PendingSquare[];
    revealedEmails: Set<string>;
  };
  error: string | null;
}

export interface ScoreState {
  current: {
    values: Score;
    input: { vertical: string; horizontal: string; };
  };
  quarters: {
    [key: string]: {
      isEditing: boolean;
      editValues?: EditScore;
      values: Score;
    };
  };
}

export interface JoinFormState {
  isVisible: boolean;
  name: string;
  email: string;
} 