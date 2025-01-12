import { useCallback, useState } from 'react';
import styles from './GameHistory.module.css';
import DiceRoll from './DiceRoll';
import gameData from '../data/GameData.json';
import { GameSession } from '../types/gameTypes';
import { api } from '../services/api';

interface RollHistoryEntry {
  type: 'roll';
  roll: number;
  step: number;
  timestamp: string;
  outcome?: string;
  currentPosition?: number;
  question?: string;
}

interface GameHistoryProps {
  climb: () => void;
  history: HistoryEntry[]; 
  currentStep: number;
  gameOver: boolean;
  onNewRoll: (entry: HistoryEntry) => void;
  onUpdateNarrative: (step: number, scenarios: string[]) => void;
  setGameOver: (value: boolean) => void;
}

interface StepLog {
  type: 'step';
  step: number;
  timestamp: string;
  direction?: 'forward' | 'backward';
  scenarios?: string[];
}

type HistoryEntry = RollHistoryEntry | StepLog;

export function GameHistory({ climb, history, currentStep, gameOver, onNewRoll, onUpdateNarrative, setGameOver }: GameHistoryProps) {
  // console.log('Rendering history component with:', history);
  const [diceValue, setDiceValue] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [gameSession, setGameSession] = useState<GameSession>(() => {
      const savedSession = JSON.parse(localStorage.getItem('gameSession') || '{}');
      return {
        ...savedSession,
        steps: savedSession.steps || [],
        narrative: savedSession.narrative || ''
      };
    });

  const getRandomScenarios = (stepIndex: number, isFinalStep: boolean = false): string[] => {
    if (isFinalStep) {
      return [];
    }
    const stepData = gameData[stepIndex];
    if (!stepData?.scenarios) return [];
    
    // Get 1 unique random scenarios
    const shuffled = [...stepData.scenarios]
      .sort(() => Math.random() - 0.5)
      .slice(0, 1);
    
      const stepNumber = stepIndex
      const scenarios = shuffled
      setGameSession(prev => {
        const newSteps = [...(prev.steps || [])];
        const age = stepIndex
        newSteps[stepIndex] = {
          ...newSteps[stepIndex],
          stepNumber,
          age,
          scenarios
        };
        const newNarrative = prev.narrative + 
        `\nAt age ${age}, ${scenarios.join(' ')}`;
      
        const updatedSession = { 
          ...prev, 
          steps: newSteps,
          narrative: newNarrative
        };
        try {
          const storedSession = localStorage.getItem('gameSession');
          const gameSession = storedSession ? JSON.parse(storedSession) : null;
          api.addEventAtAge({
            gameSessionId: gameSession.sessionId, 
            playerId: gameSession.playerId, 
            age: stepNumber, 
            eventDescription: scenarios.join(' ') 
          });
        } catch(error) {
          console.error('Failed to add event:', error);
        }
        localStorage.setItem('gameSession', JSON.stringify(updatedSession));
        return updatedSession;
      });
    return shuffled;
  };

  const handleDiceRoll = useCallback(async (value: number) => {
    const potentialPosition = currentStep + value;
    
    // If we're near 100, handle special cases
    if (currentStep > 94) {
      if (potentialPosition > 100) {
        // Invalid move - let player roll again
        return;
      }
    }

    setDiceValue(value);
    setIsMoving(true);

    // Then create and process step logs
    const stepLogs: StepLog[] = [];
    for (let i = 0; i < value; i++) {
      const nextStep = currentStep + i + 1;
      const isLastStep = i === value - 1;
      const scenarios = getRandomScenarios(nextStep, isLastStep);
      
      if (scenarios.length > 0) {
        onUpdateNarrative(nextStep, scenarios);
      }

      const stepLog: StepLog = {
        type: 'step',
        step: nextStep,
        timestamp: new Date().toLocaleTimeString(),
        scenarios: scenarios
      };
      
      stepLogs.push(stepLog);
    }

    const rollEntry: RollHistoryEntry = {
      type: 'roll',
      roll: value,
      step: currentStep,
      timestamp: new Date().toLocaleTimeString(),
      currentPosition: currentStep + value,
      outcome: "Moving forward..."
    };
    // console.log('Creating roll entry:', rollEntry);

    // Process steps after roll entry is added
    for (const stepLog of stepLogs) {
      onNewRoll(stepLog);
      await new Promise(resolve => setTimeout(resolve, 800));
      climb();
    }
    onNewRoll(rollEntry); 

    if (potentialPosition === 100) {
      setGameOver(true); 
    }
    
    setIsMoving(false);
  }, [climb, currentStep, onNewRoll, onUpdateNarrative]);

  return (
    <div className={styles.gameInformationPanel}>
      <div className={styles.diceRoll}>
      <DiceRoll onRoll={handleDiceRoll} disabled={gameOver || isMoving} />
      </div>
      <div className={styles.historyPanel}>
        <h3 className={styles.historyTitle}>Game History</h3>
        <div className={styles.historyList}>
          {history.length === 0 ? (
            <p className={styles.noHistory}>No moves yet</p>
          ) : (
            [...history]
              .reverse()
              .map((entry, index) => (
                <div key={index} className={`
                  ${entry.type === 'step' ? styles.stepEntry : styles.historyEntry}
                  ${entry.type === 'step' && entry.direction === 'backward' ? styles.backward : ''}
                `}>
                  {entry.type === 'roll' ? (
                    <>
                      <div className={styles.entryHeader}>
                        <span className={styles.rollNumber}>
                          Rolled a {entry.roll}
                        </span>
                        <span className={styles.rollTime}>{entry.timestamp}</span>
                      </div>
                      <div className={styles.rollDetails}>
                        {entry.question && (
                          <div className={styles.questionText}>
                            <b>Question: </b>{entry.question}
                          </div>
                        )}
                        {entry.outcome && (
                          <div className={styles.rollOutcome}>
                            <b>Response: </b>{entry.outcome}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.entryHeader}>
                        <span className={styles.stepNumber}>
                          {currentStep === entry.step 
                            ? `You are at step ${entry.step}`
                            : `Traversed Step ${entry.step}`
                          }
                        </span>
                        <span className={styles.rollTime}>{entry.timestamp}</span>
                      </div>
                      <div className={styles.stepDetails}>
                        <div>
                          {currentStep === entry.step 
                            ? ``
                            : entry.direction === 'backward'
                              ? `Moved back to step ${entry.step}`
                              : ``
                          }
                        </div>
                        {entry.scenarios && entry.scenarios.length > 0 && (
                          <div className={styles.scenariosList}>
                            {entry.scenarios.map((scenario, idx) => (
                              <div key={idx} className={styles.scenarioItem}>{scenario}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

export default GameHistory;

