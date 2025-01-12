import { useState, useCallback } from 'react';

export interface GameState {
  currentStep: number;
  isLoading: boolean;
  error: string | null;
}

export function useGameState(maxSteps: number = 100) {
  console.log('useGameState called with maxSteps:', maxSteps);
  const [state, setState] = useState<GameState>({
    currentStep: 0,
    isLoading: true,
    error: null
  });

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const incrementStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, maxSteps)
    }));
  }, [maxSteps]);

  const decrementStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0) // Don't go below 0
    }));
  }, []);

  const resetGame = useCallback(() => {
    setState({
      currentStep: 0,
      isLoading: false,
      error: null
    });
  }, []);

  return {
    state,
    setError,
    setLoading,
    incrementStep,
    decrementStep,
    resetGame
  };
}

export default useGameState;