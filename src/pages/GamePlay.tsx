import './GamePlay.css';
// import { DiceRoll } from '../components/DiceRoll';
import { QuestionPanel } from '../components/QuestionPanel';
import { useState, useCallback, useEffect } from 'react';
import { GameHistory } from '../components/GameHistory';
import gameData from '../data/GameData.json';
import { GameSession } from '../types/GameTypes';


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
  scenarios?: string[];
  timestamp: string;
}

type HistoryEntry = RollHistoryEntry | StepLog;

function GamePlay({ climb, fall, currentStep, gameOver }: GamePlayProps) {
  console.log('Rendering GamePlay with step:', currentStep);

  const [gameSession, setGameSession] = useState<GameSession>(() => {
    const savedSession = JSON.parse(localStorage.getItem('gameSession') || '{}');
    return {
      ...savedSession,
      steps: savedSession.steps || []
    };
  });
  const [rollHistory, setRollHistory] = useState<HistoryEntry[]>([]);
  const [showQuestion, setShowQuestion] = useState(false);
  const [questionKey, setQuestionKey] = useState(0);
  // const [isMoving, setIsMoving] = useState(false);
  // const [diceValue, setDiceValue] = useState(0);
  // const [rollHistory, setRollHistory] = useState<HistoryEntry[]>([
  //   {
  //     type: 'step',
  //     step: 0,
  //     scenarios: getRandomScenarios(0),
  //     timestamp: new Date().toLocaleTimeString()
  //   }
  // ]);
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    if (rollHistory.length === 0) {
      const initialScenarios = getRandomScenarios(0);
      setRollHistory([{
        type: 'step',
        step: 0,
        scenarios: initialScenarios,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  }, []);

  // When scenarios are generated
  const updateStepScenarios = (stepNumber: number, scenarios: string[]) => {
    setGameSession(prev => {
      const newSteps = [...(prev.steps || [])];
      newSteps[stepNumber] = {
        ...newSteps[stepNumber],
        stepNumber,
        scenarios,
      };
      const updatedSession = { ...prev, steps: newSteps };
      localStorage.setItem('gameSession', JSON.stringify(updatedSession));
      return updatedSession;
    });
  };

  // Pass this to QuestionPanel
  const updateStepQuestion = (stepNumber: number, questionData: any) => {
    setGameSession(prev => {
      const newSteps = [...(prev.steps || [])];
      if (!newSteps[stepNumber]) {
        newSteps[stepNumber] = { stepNumber, scenarios: [] };
      }
      newSteps[stepNumber].question = {
        questionData,
        selectedAnswer: null
      };
      const updatedSession = { ...prev, steps: newSteps };
      localStorage.setItem('gameSession', JSON.stringify(updatedSession));
      return updatedSession;
    });
  };

  // Pass this to QuestionPanel
  const updateStepAnswer = (stepNumber: number, selectedAnswer: any) => {
    setGameSession(prev => {
      const newSteps = [...(prev.steps || [])];
      if (newSteps[stepNumber]?.question) {
        newSteps[stepNumber].question!.selectedAnswer = selectedAnswer;
      }
      const updatedSession = { ...prev, steps: newSteps };
      localStorage.setItem('gameSession', JSON.stringify(updatedSession));
      return updatedSession;
    });
  };

  const getRandomScenarios = (stepIndex: number): string[] => {
    const stepData = gameData[stepIndex];
    if (!stepData?.scenarios) return [];
    
    const shuffled = [...stepData.scenarios]
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    
    updateStepScenarios(stepIndex, shuffled);
    
    return shuffled;
  };

  
  
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


  const handleCorrectAnswer = useCallback((playerAnswer: string, fullAnswerObj: any) => {
    setShowQuestion(false);
    setShowHistory(true);
    updateStepAnswer(currentStep, fullAnswerObj);
    // setDiceValue(0);
    setRollHistory(prev => {
      const lastEntry = prev[prev.length - 1];
      return [...prev.slice(0, -1), {
        ...lastEntry,
        outcome: `Answered "${playerAnswer}" - Correct! Staying at current position.`
      }];
    });
  }, []);

  const handleWrongAnswer = useCallback((playerAnswer: string, correctAnswer: string, fullAnswerObj: any) => {
    setShowQuestion(false);
    setShowHistory(true);
    updateStepAnswer(currentStep, fullAnswerObj);
    setRollHistory(prev => {
      const lastEntry = prev[prev.length - 1];
      return [...prev.slice(0, -1), {
        ...lastEntry,
        outcome: `Answered "${playerAnswer}" - Wrong! The correct answer was "${correctAnswer}". Moving back one step.`
      },
      {
        type: 'step',
        step: currentStep - 1,
        timestamp: new Date().toLocaleTimeString(),
        direction: 'backward' // Optional: add this to your StepLog interface
      }];
    });
    fall();
    // setDiceValue(0);
  }, [fall, currentStep]);

  const handleNewRoll = (entry: HistoryEntry) => {
    setRollHistory(prev => [...prev, entry]);
    
    // Wait for 800ms per step (matching your climb animation delay) 
    // Plus a small extra delay (200ms) to ensure movement is complete
    if (entry.type === 'roll') {
      const delayInMs = (entry.roll * 800) + 400;
      
      setTimeout(() => {
        setShowHistory(false);
        setQuestionKey(prev => prev + 1); // Force new question instance
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
            key={questionKey} // This ensures new instance on new roll
            currentStep={currentStep}
            gameData={gameData}
            onCorrectAnswer={handleCorrectAnswer}
            onWrongAnswer={handleWrongAnswer}
            onQuestionSet={(questionData) => updateStepQuestion(currentStep, questionData)}
          />
        ) : null}
      </div>
    </div>
    </>
    
  );
}

export default GamePlay;
