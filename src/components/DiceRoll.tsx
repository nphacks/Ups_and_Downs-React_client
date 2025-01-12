import { useState, useEffect, useRef } from 'react';
import './DiceRoll.css';

interface DiceRollProps {
  onRoll: (value: number) => void;
  disabled: boolean;
}

export function DiceRoll({ onRoll, disabled }: DiceRollProps) {
  const [currentRoll, setCurrentRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup function
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setCurrentRoll(null);
      setIsRolling(false);
    };
  }, []);

  const rollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    setCurrentRoll(null);
    const roll = Math.floor(Math.random() * 6) + 1;
    
    let count = 0;
    intervalRef.current = setInterval(() => {
      setCurrentRoll(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 10) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setCurrentRoll(roll);
        setIsRolling(false);
        onRoll(roll);
        
      }
    }, 100);
  };

  const DicePatterns = {
    1: [[4]],
    2: [[0], [8]],
    3: [[0], [4], [8]],
    4: [[0, 2], [6, 8]],
    5: [[0, 2], [4], [6, 8]],
    6: [[0, 2], [3, 5], [6, 8]]
  };

  const renderDots = (number: number) => {
    const pattern = DicePatterns[number as keyof typeof DicePatterns];
    return (
      <div className="dice-face">
        {[...Array(9)].map((_, index) => (
          <div 
            key={index} 
            className={`dot-position ${
              pattern.some(row => row.includes(index)) ? 'dot' : ''
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="dice-container">
      <div className={`dice ${isRolling ? 'rolling' : ''}`}>
        {currentRoll !== null && renderDots(currentRoll)}
      </div>
      <button 
        onClick={rollDice} 
        className="dice-button"
        disabled={disabled || isRolling}
      >
        {isRolling ? 'Rolling...' : 'Roll Dice'}
      </button>
    </div>
  );
}

export default DiceRoll;