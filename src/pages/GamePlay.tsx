import './GamePlay.css';
// import { DiceRoll } from '../components/DiceRoll';
import { QuestionPanel } from '../components/QuestionPanel';
import { useState, useCallback } from 'react';
import { GameHistory } from '../components/GameHistory';

interface GamePlayProps {
  climb: () => void;
  fall: () => void;
  currentStep: number;
  gameOver: boolean;
}

interface RollHistoryEntry {
  type: 'roll';
  roll: number;
  step: number;
  timestamp: string;
  outcome?: string;
  currentPosition?: number;
}

interface StepLog {
  type: 'step';
  step: number;
  timestamp: string;
}

type HistoryEntry = RollHistoryEntry | StepLog;

function GamePlay({ climb, fall, currentStep, gameOver }: GamePlayProps) {
  console.log('Rendering GamePlay with step:', currentStep);
  const [showQuestion, setShowQuestion] = useState(false);
  const [questionKey, setQuestionKey] = useState(0);
  
  // const [isMoving, setIsMoving] = useState(false);
  // const [diceValue, setDiceValue] = useState(0);
  const [rollHistory, setRollHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  
  // Retrieve history when component mounts
  // useEffect(() => {
  //   const savedHistory = localStorage.getItem('rollHistory');
  //   console.log('Loading saved history:', savedHistory);
  //   if (savedHistory) {
  //     try {
  //       const parsed = JSON.parse(savedHistory);
  //       console.log('Parsed history:', parsed);
  //       // setRollHistory(parsed);
  //     } catch (e) {
  //       console.error('Error loading history:', e);
  //       // setRollHistory([]);
  //     }
  //   }
  // }, []);
  
  // Save history when it changes
  // useEffect(() => {
  //   if (rollHistory.length > 0) {
  //     const historyString = JSON.stringify(rollHistory);
  //     localStorage.setItem('rollHistory', historyString);
  //     console.log('Saved history:', rollHistory);
  //   }
  //   console.log('Current history state:', rollHistory);
  // }, [rollHistory]);

  

  // const handleDiceRoll = useCallback(async (value: number) => {
  //   setDiceValue(value);
  //   setIsMoving(true);
  //   const newHistoryEntry = {
  //     roll: value,
  //     step: currentStep,
  //     timestamp: new Date().toLocaleTimeString(),
  //     currentPosition: currentStep,
  //     outcome: "Moving forward..."
  //   };
  //   setRollHistory(prev => [...prev, newHistoryEntry]);
  //   console.log('New roll added:', newHistoryEntry);
    
  //   // Move player first
  //   for (let i = 0; i < value; i++) {
  //     await new Promise(resolve => setTimeout(resolve, 800)); // Animation delay
  //     climb();
  //   }
    
  //   setIsMoving(false);
  //   // Show question after movement is complete
  //   setQuestionKey(prev => prev + 1);
  //   setShowQuestion(true);
  // }, [climb]);

  const handleCorrectAnswer = useCallback((playerAnswer: string) => {
    setShowQuestion(false);
    setShowHistory(true);
    // setDiceValue(0);
    setRollHistory(prev => {
      const lastEntry = prev[prev.length - 1];
      return [...prev.slice(0, -1), {
        ...lastEntry,
        outcome: `Answered "${playerAnswer}" - Correct! Staying at current position.`
      }];
    });
  }, []);

  const handleWrongAnswer = useCallback((playerAnswer: string, correctAnswer: string) => {
    setShowQuestion(false);
    setShowHistory(true);
    setRollHistory(prev => {
      const lastEntry = prev[prev.length - 1];
      return [...prev.slice(0, -1), {
        ...lastEntry,
        outcome: `Answered "${playerAnswer}" - Wrong! The correct answer was "${correctAnswer}". Moving back one step.`
      }];
    });
    fall();
    // setDiceValue(0);
  }, [fall]);

  const handleNewRoll = (entry: HistoryEntry) => {
    setRollHistory(prev => [...prev, entry]);
    
    // Wait for 800ms per step (matching your climb animation delay) 
    // Plus a small extra delay (200ms) to ensure movement is complete
    if (entry.type === 'roll') {
      const delayInMs = (entry.roll * 800) + 400;
      
      setTimeout(() => {
        setShowHistory(false);
        setQuestionKey(prev => prev + 1);
        setShowQuestion(true);
      }, delayInMs);
    }
  };

  // Reset history when game is over
  // useEffect(() => {
  //   if (gameOver) {
  //     setTimeout(() => {
  //       localStorage.removeItem('rollHistory');
  //       setRollHistory([]);
  //     }, 2000);
  //   }
  // }, [gameOver]);


  return (
    <>
        <div className="game-container">
          <div className={`history-panel ${showHistory ? 'open' : 'closed'}`}>
            <GameHistory 
              climb={climb}
              history={rollHistory} 
              currentStep={currentStep}
              onNewRoll={handleNewRoll}
            />
          </div>
          <div className="game-content">
            {gameOver ? (
              <div className="game-over">
                <h2>Game Over!</h2>
                <p>You reached step {currentStep}</p>
              </div>
            ) : showQuestion ? (
              <QuestionPanel
                key={questionKey}
                onCorrectAnswer={(answer) => handleCorrectAnswer(answer)}
                onWrongAnswer={(playerAnswer, correctAnswer) => handleWrongAnswer(playerAnswer, correctAnswer)}
              />
            ) : null}
          </div>
            {/* <div className="game-content">
                {gameOver ? (
                <div className="game-over">
                    <h2>Game Over!</h2>
                    <p>You reached step {currentStep}</p>
                </div>
                ) : !showQuestion ? (
                <DiceRoll onRoll={handleDiceRoll} />
                <>Dice roll substitute</>
                ) : (
                <QuestionPanel
                    key={questionKey}
                    onCorrectAnswer={handleCorrectAnswer}
                    onWrongAnswer={handleWrongAnswer}
                />
                <>Question Panel substitute</>
                )}
                {diceValue > 0 && (
                <div className="dice-roll-display">
                    Last Roll: {diceValue}
                </div>
                )}
            </div> */}
        </div>
        <div style={{height: '200px'}}><h1>SHOW QUESTION {showQuestion}</h1></div>
    </>
    
  );
}

export default GamePlay;
