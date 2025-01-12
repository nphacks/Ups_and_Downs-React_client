
interface GameControlsProps {
  onClimb: () => void;
  onEnd: () => void;
  currentStep: number;
}

export function GameControls({ onEnd, currentStep }: GameControlsProps) {
  return (
    <div className="game-controls">
      <h1>Game</h1>
      <button onClick={onEnd}>End Game</button>
      <div className="step-counter">Steps: {currentStep}</div>
      <div className="game-instructions">
        <h3>How to Play</h3>
        <p>Roll the dice to climb 1-3 steps at a time!</p>
      </div>
    </div>
  );
}

export default GameControls;