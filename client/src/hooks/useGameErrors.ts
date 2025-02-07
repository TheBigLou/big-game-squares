import { useState } from 'react';

interface UseGameErrorsReturn {
  error: string | null;
  setError: (error: string | null) => void;
  handleError: (err: any, defaultMessage: string) => void;
  clearError: () => void;
}

export function useGameErrors(): UseGameErrorsReturn {
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: any, defaultMessage: string) => {
    const errorMessage = err?.response?.data?.error || err?.message || defaultMessage;
    setError(errorMessage);
  };

  const clearError = () => setError(null);

  return {
    error,
    setError,
    handleError,
    clearError
  };
} 