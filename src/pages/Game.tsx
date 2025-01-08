import { useNavigate } from 'react-router-dom';
import { useEffect, useCallback } from 'react';
import { characterModel } from '../model';
import GameRenderer from '../components/GameRenderer';

import GamePlay from './GamePlay';
import useGameState from '../hooks/useGameState';
// import type { GameState } from '../hooks/useGameState';

import './Game.css';
import '../styles/error.css';

function Game() {
  const navigate = useNavigate();
  const {
    state: { currentStep, isLoading, error },
    setError,
    setLoading,
    incrementStep,
    decrementStep,
    resetGame,
  } = useGameState(100);

  // Reset game state when component unmounts
  useEffect(() => {
    return () => {
      resetGame();
    };
  }, [resetGame]);

  const handleClimb = useCallback(() => {
    if (!isLoading && !error) {
      incrementStep();
    }
  }, [isLoading, error, incrementStep]);

  const handleFall = useCallback(() => {
    if (!isLoading && !error) {
      decrementStep();
    }
  }, [isLoading, error, decrementStep]);

  const handleGameComplete = useCallback(() => {
    resetGame();
    navigate('/analysis');
  }, [navigate, resetGame]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault();
        event.stopPropagation();
        handleClimb();
      } else if (event.code === 'Escape') {
        handleGameComplete();
      }
    };
    window.addEventListener('keydown', handleKey, { passive: false });
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleClimb, handleGameComplete]);

  useEffect(() => {
    if (currentStep >= 100) {
      handleGameComplete();
    }
  }, [currentStep, handleGameComplete]);

  // Only show critical errors that prevent gameplay
  if (error && error !== 'Failed to load character model') {
    return (
      <div className="game-page">
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="game-page">
        <div className="loading-message">
          Loading game assets...
        </div>
      </div>
    );
  }

  return (
    <div className="game-page" style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="game-renderer-container">
        <GameRenderer
          onError={setError}
          onLoadComplete={() => setLoading(false)}
          onContextLost={() => setError('WebGL context lost. Please refresh the page.')}
          characterModel={characterModel}
          currentStep={currentStep}
        />
      </div>
      <GamePlay 
          climb={handleClimb}
          fall={handleFall}
          currentStep={currentStep}
          gameOver={currentStep >= 100}
        />
      </div>
    // </div>
  );
}

export default Game;