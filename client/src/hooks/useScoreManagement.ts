import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateGameScore, updateCurrentScore } from '../api/client';
import { Score, GameScores } from '../types/game';

export function useScoreManagement(gameId: string, initialScores?: GameScores) {
  const queryClient = useQueryClient();
  const [inputValues, setInputValues] = useState<Score>(() => 
    initialScores?.current || { vertical: 0, horizontal: 0 }
  );

  // Update input values when server state changes
  useEffect(() => {
    if (initialScores?.current) {
      setInputValues(initialScores.current);
    }
  }, [initialScores?.current?.vertical, initialScores?.current?.horizontal]);

  const updateCurrentScoreMutation = useMutation({
    mutationFn: (score: Score) => {
      const email = localStorage.getItem('email');
      if (!email) {
        throw new Error('Owner email not found');
      }
      return updateCurrentScore(gameId, {
        ownerEmail: email,
        score
      });
    },
    onSuccess: (response: { game: any }) => {
      queryClient.setQueryData(['game', gameId], (oldData: any) => ({
        ...oldData,
        game: response.game
      }));
      // Reset input values to match server state
      setInputValues(response.game.scores.current);
    }
  });

  const updateQuarterScoreMutation = useMutation({
    mutationFn: (data: { quarter: keyof GameScores; score: Score }) => {
      const email = localStorage.getItem('email');
      if (!email) {
        throw new Error('Owner email not found');
      }
      return updateGameScore(gameId, {
        ownerEmail: email,
        quarter: data.quarter,
        score: data.score
      });
    },
    onSuccess: (response: { game: any }) => {
      queryClient.setQueryData(['game', gameId], (oldData: any) => ({
        ...oldData,
        game: response.game
      }));
    }
  });

  const handleScoreChange = (team: 'vertical' | 'horizontal', value: string) => {
    const sanitizedValue = value.replace(/[^0-9]/g, '');
    const numValue = parseInt(sanitizedValue) || 0;
    setInputValues(prev => ({
      ...prev,
      [team]: numValue
    }));
  };

  const handleCurrentScoreSubmit = () => {
    updateCurrentScoreMutation.mutate(inputValues);
  };

  const handleQuarterSave = (quarter: keyof GameScores, score: Score) => {
    updateQuarterScoreMutation.mutate({ quarter, score });
  };

  return {
    inputValues,
    handleScoreChange,
    handleQuarterSave,
    handleCurrentScoreSubmit,
    isUpdatingScore: updateCurrentScoreMutation.isPending || updateQuarterScoreMutation.isPending
  };
} 