import { useState, useEffect, useRef } from 'react';
import './DiceRoll.css';

interface DiceRollProps {
  onRoll: (value: number) => void;
}

export function DiceRoll({ onRoll }: DiceRollProps) {
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
    const roll = Math.floor(Math.random() * 3) + 1;
    
    let count = 0;
    intervalRef.current = setInterval(() => {
      setCurrentRoll(Math.floor(Math.random() * 3) + 1);
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

  return (
    <div className="dice-container">
      <div className={`dice ${isRolling ? 'rolling' : ''}`}>
        {currentRoll !== null && (
          <div className="dice-face">
            {[...Array(currentRoll)].map((_, i) => (
              <div key={i} className="dot" />
            ))}
          </div>
        )}
      </div>
      <button 
        onClick={rollDice} 
        className="dice-button"
        disabled={isRolling}
      >
        {isRolling ? 'Rolling...' : 'Roll Dice'}
      </button>
      
    </div>
  );
}

export default DiceRoll;