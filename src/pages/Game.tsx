import { useNavigate } from 'react-router-dom';
import { useEffect, useCallback, useState } from 'react';
import { characterModel } from '../model';
import GameRenderer from '../components/GameRenderer';

import GamePlay from './GamePlay';
import useGameState from '../hooks/useGameState';

import './Game.css';
import '../styles/error.css';
import { generateSnakeLadderPositions } from '../utils/GameUtils';

function Game() {
  console.log('1. GameRendered at:', new Date().toISOString());
  
  const navigate = useNavigate();
  console.log('2. After navigate initialization');

  const [snakeLadderPositions] = useState<Set<number>>(() => {
    console.log('3. Generating snake ladder positions');
    const positions = generateSnakeLadderPositions();
    localStorage.setItem('snakeLadderPositions', JSON.stringify([...positions]));
    return positions;
  });
  console.log('4. After snake ladder positions');

  const {
    state: { currentStep, isLoading, error },
    setError,
    setLoading,
    incrementStep,
    decrementStep,
    resetGame,
  } = useGameState(100);
  console.log('5. After useGameState', { currentStep, isLoading, error });

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
    // resetGame();
    // navigate('/analysis');
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
  
  try {
  // Only show critical errors that prevent gameplay
    if (error && error !== 'Failed to load character model') {
      console.log('6a. Rendering error state');
      return (
        <div className="game-page">
          <div className="error-message">
            {error}
          </div>
        </div>
      );
    }

    if (isLoading) {
      console.log('6b. Rendering loading state');
      return (
        <div className="game-page">
          <div className="loading-message">
            Loading game assets...
          </div>
        </div>
      );
    }
    console.log('6c. About to render main component');
    return (
      <div className="game-page" style={{ position: 'relative', minHeight: '100vh' }}>
        <div className="game-renderer-container">
          <GameRenderer
            onError={setError}
            onLoadComplete={() => setLoading(false)}
            onContextLost={() => setError('WebGL context lost. Please refresh the page.')}
            characterModel={characterModel}
            currentStep={currentStep}
            snakeLadderPositions={snakeLadderPositions}
          />
        </div>
        <GamePlay 
          climb={handleClimb}
          fall={handleFall}
          currentStep={currentStep}
          snakeLadderPositions={snakeLadderPositions}
        />
      </div>
    );
  } catch (err) {
    console.error('7. Render error caught:', err);
    return <div>Something went wrong</div>;
  }
}

export default Game;