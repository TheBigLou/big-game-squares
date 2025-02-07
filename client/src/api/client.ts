import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Game API
export const createGame = async (data: {
  name: string;
  ownerEmail: string;
  ownerName: string;
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
}) => {
  const response = await api.post('/games', data);
  return response.data;
};

export const getGame = async (gameId: string) => {
  const response = await api.get(`/games/${gameId}`);
  return response.data;
};

export const startGame = async (gameId: string, ownerEmail: string) => {
  const response = await api.post(`/games/${gameId}/start`, { ownerEmail });
  return response.data;
};

export const updateGameScore = async (gameId: string, data: {
  ownerEmail: string;
  quarter: string;
  score: {
    vertical: number;
    horizontal: number;
  }
}) => {
  const response = await api.post(`/games/${gameId}/score`, data);
  return response.data;
};

export const updateCurrentScore = async (gameId: string, data: {
  ownerEmail: string;
  score: {
    vertical: number;
    horizontal: number;
  }
}) => {
  const response = await api.post(`/games/${gameId}/current-score`, data);
  return response.data;
};

// Player API
export const joinGame = async (gameId: string, data: { name: string; email: string }) => {
  const response = await api.post(`/games/${gameId}/join`, data);
  return response.data;
};

export const selectSquare = async (gameId: string, data: { 
  email: string; 
  row: number; 
  col: number; 
}) => {
  const response = await api.post(`/games/${gameId}/squares`, data);
  return response.data;
};

export const getPlayerSquares = async (gameId: string, email: string) => {
  const response = await api.get(`/games/${gameId}/squares`, { 
    params: { email } 
  });
  return response.data;
};

// Add these new functions
export const updatePendingSquares = async (gameId: string, data: {
  email: string;
  squares: Array<{ row: number; col: number; }>;
}) => {
  const response = await api.post(`/games/${gameId}/pending-squares`, data);
  return response.data;
};

export const getPendingSquares = async (gameId: string) => {
  const response = await api.get(`/games/${gameId}/pending-squares`);
  return response.data;
}; 