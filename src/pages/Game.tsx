import { useNavigate } from 'react-router-dom';
import { useEffect, useCallback, useState } from 'react';
import { characterModel } from '../model';
import GameRenderer from '../components/GameRenderer';

import GamePlay from './GamePlay';
import useGameState from '../hooks/useGameState';

import './Game.css';
import '../styles/error.css';
import { generateSnakeLadderPositions } from '../utils/GameUtils';

const Instructions = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="instructions-overlay">
      <div className="instructions-panel">
        <button className="close-button" style={{color: 'black'}} onClick={onClose}>×</button>
        <h2>How to Play</h2>
        <ul>
          <li>Roll a die to move forward on your life journey.</li>
          <li>Track your life events in the History Panel on the left.</li>
          <li>Each step represents a moment in your life journey.</li>
          <li>Face life decisions at each step:
            <ul>
              <li>Regular life decisions on Green Steps</li>
              <li>Major life-changing decisions on Golden Steps</li>
            </ul>
          </li>
          <li>Complete your journey by reaching step 100!</li>
          <li>Reflect on your life choices in the final analysis.</li>
        </ul>
      </div>
    </div>
  );
};

function Game() {  
  const navigate = useNavigate();

  const [showInstructions, setShowInstructions] = useState(false);
  const [snakeLadderPositions] = useState<Set<number>>(() => {
    const positions = generateSnakeLadderPositions();
    localStorage.setItem('snakeLadderPositions', JSON.stringify([...positions]));
    return positions;
  });

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
            <GameRenderer
              onError={setError}
              onLoadComplete={() => {
                setLoading(false);
              }}
              onContextLost={() => setError('WebGL context lost. Please refresh the page.')}
              characterModel={characterModel}
              currentStep={currentStep}
              snakeLadderPositions={snakeLadderPositions}
            />
          </div>
        </div>
      );
    }
    return (
      <div className="game-page" style={{ position: 'relative', minHeight: '100vh' }}>
         <button 
            className="instructions-button"
            onClick={() => setShowInstructions(true)}
          >
            How to Play
          </button>
          {showInstructions && (
            <Instructions onClose={() => setShowInstructions(false)} />
          )}
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
    return <div>Something went wrong</div>;
  }
}

export default Game;