import { useCallback, useState } from 'react';
import styles from './GameHistory.module.css';
import DiceRoll from './DiceRoll';

interface RollHistoryEntry {
  type: 'roll';
  roll: number;
  step: number;
  timestamp: string;
  outcome?: string;
  currentPosition?: number;
}

interface GameHistoryProps {
  climb: () => void;
  history: HistoryEntry[]; 
  currentStep: number;
  onNewRoll: (entry: HistoryEntry) => void;
}

interface StepLog {
  type: 'step';
  step: number;
  timestamp: string;
}

type HistoryEntry = RollHistoryEntry | StepLog;

export function GameHistory({ climb, history, currentStep, onNewRoll }: GameHistoryProps) {
  console.log('Rendering history component with:', history);
  const [diceValue, setDiceValue] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  // const [rollHistory, setRollHistory] = useState<RollHistoryEntry[]>([]);

  const handleDiceRoll = useCallback(async (value: number) => {
    setDiceValue(value);
    setIsMoving(true);

    // Create all step logs first
    const stepLogs: StepLog[] = [];
    for (let i = 0; i < value; i++) {
      const stepLog: StepLog = {
        type: 'step',
        step: currentStep + i + 1,
        timestamp: new Date().toLocaleTimeString()
      };
      stepLogs.push(stepLog);
    }

    const rollEntry: RollHistoryEntry = {
      type: 'roll',
      roll: value,
      step: currentStep,
      timestamp: new Date().toLocaleTimeString(),
      currentPosition: currentStep,
      outcome: "Moving forward..."
    };
    // setRollHistory(prev => [...prev, newHistoryEntry]);
    for (const stepLog of stepLogs) {
      onNewRoll(stepLog);
      await new Promise(resolve => setTimeout(resolve, 800));
      climb();
    }
    onNewRoll(rollEntry);
    console.log('New roll added:', rollEntry, diceValue, isMoving);
    
    // Move player first
    // for (let i = 0; i < value; i++) {
    //   const stepLog: StepLog = {
    //     type: 'step',
    //     step: currentStep + i + 1,
    //     timestamp: new Date().toLocaleTimeString()
    //   };
    //   onNewRoll(stepLog);
    //   await new Promise(resolve => setTimeout(resolve, 800));
    //   climb();
    // }
    
    setIsMoving(false);
    // Show question after movement is complete
    // setQuestionKey(prev => prev + 1);
    // setShowQuestion(true);
  }, [climb, currentStep, onNewRoll]);

  return (
    <div className={styles.gameInformationPanel}>
      <div className={styles.diceRoll}>
        <DiceRoll onRoll={handleDiceRoll} />
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
                <div key={index} className={
                  entry.type === 'step' ? styles.stepEntry : styles.historyEntry
                }>
                  {entry.type === 'roll' ? (
                    <>
                      <div className={styles.entryHeader}>
                        <span className={styles.rollNumber}>
                        Roll #{history.filter(h => h.type === 'roll').length - 
                          history.filter(h => h.type === 'roll').reverse().findIndex(h => h === entry)}
                        </span>
                        <span className={styles.rollTime}>{entry.timestamp}</span>
                      </div>
                      <div className={styles.rollDetails}>
                        Rolled a {entry.roll} at step {entry.step}
                        {entry.outcome && (
                          <div className={styles.rollOutcome}>{entry.outcome}</div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.entryHeader}>
                        <span className={styles.stepNumber}>Step Log</span>
                        <span className={styles.rollTime}>{entry.timestamp}</span>
                      </div>
                      <div className={styles.stepDetails}>
                        <div>Step {entry.step}</div>
                        <div>Step was traversed.</div>
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