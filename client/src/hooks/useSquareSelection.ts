import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { selectSquare, updatePendingSquares } from '../api/client';
import { Square, PendingSquare, PendingSquareData, Player } from '../types/game';

interface UseSquareSelectionProps {
  gameId: string;
  currentPlayer: Player | undefined;
  email: string | null;
  squareLimit: number;
  squares: Square[];
  pendingSquaresData?: { pendingSquares: PendingSquareData[] };
  onError: (message: string) => void;
  onSuccess?: () => Promise<void>;
  gameStatus?: string;
}

export function useSquareSelection({
  gameId,
  currentPlayer,
  email,
  squareLimit,
  squares,
  pendingSquaresData,
  onError,
  onSuccess,
  gameStatus
}: UseSquareSelectionProps) {
  const [pendingSquares, setPendingSquares] = useState<PendingSquare[]>([]);

  const updatePendingSquaresMutation = useMutation({
    mutationFn: () => {
      if (!email) throw new Error('Email not found');
      return updatePendingSquares(gameId, {
        email,
        squares: pendingSquares
      });
    },
    onError: () => {
      onError('Failed to update pending squares');
    }
  });

  const selectSquareMutation = useMutation({
    mutationFn: (squares: PendingSquare[]) => {
      if (!email) throw new Error('Email not found');
      return Promise.all(squares.map(square => 
        selectSquare(gameId, { email, ...square })
      ));
    },
    onSuccess: async () => {
      setPendingSquares([]);
      if (onSuccess) await onSuccess();
    },
    onError: () => {
      onError('Failed to select squares');
    },
  });

  const handleSquareClick = (row: number, col: number) => {
    if (!currentPlayer || gameStatus !== 'setup') return;

    const otherPlayersPendingSquares = pendingSquaresData?.pendingSquares.filter(
      (s: PendingSquareData) => s.playerId !== currentPlayer._id
    ) || [];
    
    const isSquarePending = otherPlayersPendingSquares.some(
      (s: PendingSquareData) => s.row === row && s.col === col
    );

    if (isSquarePending) {
      onError('This square is being selected by another player');
      return;
    }

    setPendingSquares(prev => {
      const existingIndex = prev.findIndex(s => s.row === row && s.col === col);
      if (existingIndex >= 0) {
        const newPendingSquares = prev.filter((_, i) => i !== existingIndex);
        updatePendingSquaresMutation.mutate();
        return newPendingSquares;
      }
      
      const confirmedSquares = squares.filter((s: Square) => s.playerId === currentPlayer._id);
      if (prev.length + confirmedSquares.length >= squareLimit) {
        onError(`You can only select up to ${squareLimit} squares`);
        return prev;
      }

      const newPendingSquares = [...prev, { row, col }];
      updatePendingSquaresMutation.mutate();
      return newPendingSquares;
    });
  };

  const handleConfirmSquares = () => {
    if (pendingSquares.length === 0) {
      onError('No squares selected to confirm');
      return;
    }
    if (gameStatus !== 'setup') {
      onError('Cannot confirm squares after game has started');
      return;
    }
    selectSquareMutation.mutate(pendingSquares);
  };

  return {
    pendingSquares,
    handleSquareClick,
    handleConfirmSquares,
    isConfirming: selectSquareMutation.isPending
  };
} 