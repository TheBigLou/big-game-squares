import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateGameScore, updateCurrentScore } from '../api/client';
import { Score, GameScores } from '../types/game';

// Extend Score type to allow string values during input
type InputScore = {
  vertical: number | string;
  horizontal: number | string;
};

export function useScoreManagement(gameId: string, initialScores?: GameScores) {
  const queryClient = useQueryClient();
  const [inputValues, setInputValues] = useState<InputScore>(() => ({
    vertical: initialScores?.current?.vertical ?? 0,
    horizontal: initialScores?.current?.horizontal ?? 0
  }));

  // Update input values when server state changes
  useEffect(() => {
    if (initialScores?.current) {
      setInputValues({
        vertical: initialScores.current.vertical,
        horizontal: initialScores.current.horizontal
      });
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
    setInputValues(prev => ({
      ...prev,
      [team]: sanitizedValue === '' ? '' : parseInt(sanitizedValue)
    }));
  };

  const handleCurrentScoreSubmit = () => {
    // Convert empty values to 0 before submitting
    const scoreToSubmit: Score = {
      vertical: typeof inputValues.vertical === 'string' ? 0 : inputValues.vertical,
      horizontal: typeof inputValues.horizontal === 'string' ? 0 : inputValues.horizontal
    };
    updateCurrentScoreMutation.mutate(scoreToSubmit);
  };

  const handleQuarterSave = (quarter: keyof GameScores, score: InputScore) => {
    // Convert empty values to 0 before submitting
    const scoreToSubmit: Score = {
      vertical: typeof score.vertical === 'string' ? 0 : score.vertical,
      horizontal: typeof score.horizontal === 'string' ? 0 : score.horizontal
    };
    updateQuarterScoreMutation.mutate({ quarter, score: scoreToSubmit });
  };

  return {
    inputValues,
    handleScoreChange,
    handleQuarterSave,
    handleCurrentScoreSubmit,
    isUpdatingScore: updateCurrentScoreMutation.isPending || updateQuarterScoreMutation.isPending
  };
} 