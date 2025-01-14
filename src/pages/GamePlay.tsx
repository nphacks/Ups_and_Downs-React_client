import './GamePlay.css';
// import { DiceRoll } from '../components/DiceRoll';
import { QuestionPanel } from '../components/QuestionPanel';
import { useState, useCallback, useEffect } from 'react';
import { GameHistory } from '../components/GameHistory';
import gameData from '../data/GameData.json';
import { GameSession } from '../types/gameTypes';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import Loading from '../components/Loading';

interface GamePlayProps {
  climb: () => void;
  fall: () => void;
  currentStep: number;
  snakeLadderPositions: Set<number>;
}

interface RollHistoryEntry {
  type: 'roll';
  roll: number;
  step: number;
  timestamp: string;
  outcome?: string;
  currentPosition?: number;
  question?: string;
}

interface StepLog {
  type: 'step';
  step: number;
  scenarios?: string[];
  timestamp: string;
}

type HistoryEntry = RollHistoryEntry | StepLog;

function GamePlay({ climb, fall, currentStep, snakeLadderPositions }: GamePlayProps) {

  const [gameSession, setGameSession] = useState<GameSession>(() => {
    const savedSession = JSON.parse(localStorage.getItem('gameSession') || '{}');
    return {
      ...savedSession,
      steps: savedSession.steps || [],
      narrative: savedSession.narrative || ''
    };
  });
  const [rollHistory, setRollHistory] = useState<HistoryEntry[]>([]);
  const [showQuestion, setShowQuestion] = useState(false);
  const [questionKey, setQuestionKey] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

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

  const deployHack = (hack: number) => {
    if(hack == 2) {
      console.log(showHistory, gameSession)
    }
  };
  deployHack(0)

  // When scenarios are generated
  const updateStepScenarios = (stepNumber: number, scenarios: string[]) => {

      setGameSession(prev => {
        const newSteps = [...(prev.steps || [])];
        const age = stepNumber
        newSteps[stepNumber] = {
          ...newSteps[stepNumber],
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
        localStorage.setItem('gameSession', JSON.stringify(updatedSession));
        return updatedSession;
      });
    
    
  };

  const updateNarrativeWithScenarios = (step: number, scenarios: string[]) => {
    setGameSession(prev => {
      const age = step;
      const newNarrative = scenarios.length > 0 
        ? `${prev.narrative}\nAt age ${age}, ${scenarios.join('. ')}`
        : prev.narrative;
  
      const updatedSession = {
        ...prev,
        narrative: newNarrative
      };
      localStorage.setItem('gameSession', JSON.stringify(updatedSession));
      return updatedSession;
    });
  };
  

  // Pass this to QuestionPanel
  const updateStepQuestion = (stepNumber: number, questionData: any) => {
    setGameSession(prev => {
      const newSteps = [...(prev.steps || [])];
      const age = stepNumber
      if (!newSteps[stepNumber]) {
        newSteps[stepNumber] = {
          stepNumber,
          age,
          scenarios: [],
          question: {
            questionData,
            selectedAnswer: null
          }
        };
      } else {
        newSteps[stepNumber] = {
          ...newSteps[stepNumber],
          question: {
            questionData,
            selectedAnswer: null
          }
        };
      }
      const updatedSession = { ...prev, steps: newSteps };
      localStorage.setItem('gameSession', JSON.stringify(updatedSession));
      return updatedSession;
    });

    setRollHistory(prev => {
      const lastEntry = prev[prev.length - 1];
      if (lastEntry && lastEntry.type === 'roll') {
        return prev.map((entry, index) => 
          index === prev.length - 1 
            ? { ...entry, question: questionData.question }
            : entry
        );
      }
      return prev;
    });
  };

  // Pass this to QuestionPanel
  const updateStepAnswer = async (stepNumber: number, selectedAnswer: any) => {
    try {
      setGameSession(prev => {
        const newSteps = [...(prev.steps || [])];
        const age = stepNumber;

        if (newSteps[stepNumber]?.question) {
          const questionData = newSteps[stepNumber].question!.questionData;
          
          // Make the appropriate API call based on question type
          switch (questionData.type) {
              case 'skill':
                  api.addSkillAtAge({
                      gameSessionId: prev.sessionId,
                      playerId: prev.playerId,
                      age: age,
                      skill: selectedAnswer.skill, 
                      acquired: false
                  });
                  break;

              case 'action':
                  api.addActionAtAge({
                    gameSessionId: prev.sessionId,
                    playerId: prev.playerId,
                    age: age,
                    actionQuestion: questionData.question,
                    actionDescription: selectedAnswer.action_description,
                    tookAction: selectedAnswer.took_action || true,
                    usedAnythingForAction: selectedAnswer.used_anything || '',
                    skill: selectedAnswer.skill || '',
                    skillUsed: selectedAnswer.skill_used || false,
                    object: selectedAnswer.object || '',
                    objectUsed: selectedAnswer.object_used || false
                  });
                  break;

              case 'decision':
                  api.addDecisionAtAge({
                    gameSessionId: prev.sessionId,
                    playerId: prev.playerId,
                    age: age,
                    decisionQuestion: questionData.question,
                    decisionDescription: selectedAnswer.decision_description,
                    decisionMade: selectedAnswer.decision_made || true,
                    leadsTo: selectedAnswer.leads_to || '',
                    actionDescription: selectedAnswer.action_description || '',
                    tookAction: selectedAnswer.took_action || false,
                    skill: selectedAnswer.skill || '',
                    skillUsed: selectedAnswer.skill_used || false,
                    object: selectedAnswer.object || '',
                    objectUsed: selectedAnswer.object_used || false
                  });
                  break;

              case 'situation':
                  api.addSituationAtAge({
                    gameSessionId: prev.sessionId,
                    playerId: prev.playerId,
                    age: age,
                    situationQuestion: questionData.question,
                    situationDescription: selectedAnswer.situation_description || '',
                    leadsTo: selectedAnswer.leads_to || '',
                    decisionDescription: selectedAnswer.decision_description || '',
                    decisionMade: selectedAnswer.decision_made || true,
                    actionDescription: selectedAnswer.action_description || '',
                    tookAction: selectedAnswer.took_action || true,
                    usedAnythingForAction: selectedAnswer.used_anything || '',
                    skill: selectedAnswer.skill || '',
                    skillUsed: selectedAnswer.skill_used || true,
                    object: selectedAnswer.object || '',
                    objectUsed: selectedAnswer.object_used || true
                  });
                  break;
          }

          // Rest of your existing code
          newSteps[stepNumber] = {
              ...newSteps[stepNumber],
              question: {
                  ...newSteps[stepNumber].question!,
                  selectedAnswer
              }
          };

          let newNarrative;
          if (isSnakeLadderPosition(stepNumber)) {
              newNarrative = prev.narrative +
                  `\nAt age ${age}, ${prev.playerName} faced a critical decision "${questionData.question}", and chose "${selectedAnswer.skill || selectedAnswer.decision_description || selectedAnswer.action_description}"`;
          } else {
              newNarrative = prev.narrative +
                  `\nAt age ${age}, ${prev.playerName} faced the question "${questionData.question}", and answered "${selectedAnswer.skill || selectedAnswer.decision_description || selectedAnswer.action_description}"`;
          }

          const updatedSession = {
              ...prev,
              steps: newSteps,
              narrative: newNarrative
          };
          localStorage.setItem('gameSession', JSON.stringify(updatedSession));
          return updatedSession;
        }
        return prev;
      });
    } catch (error) {
        console.error('Error updating step answer:', error);
        showToast('Error updating step answer', 'error');
        // Handle error appropriately
    }
  };

  

  // const handleFallBack = (stepNumber: number) => {
  //   setGameSession(prev => {
  //     const age = stepNumber;
  //     const newNarrative = prev.narrative + 
  //       `\nAt age ${age}, ${prev.playerName} had a setback due to their decision or action.`;
      
  //     const updatedSession = {
  //       ...prev,
  //       narrative: newNarrative
  //     };
  //     localStorage.setItem('gameSession', JSON.stringify(updatedSession));
  //     return updatedSession;
  //   });
  // };
  

  const getRandomScenarios = (stepIndex: number): string[] => {
    const stepData = gameData[stepIndex];
    if (!stepData?.scenarios) return [];
    
    const shuffled = [...stepData.scenarios]
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    
    updateStepScenarios(stepIndex, shuffled);
    
    return shuffled;
  };

  const handleCorrectAnswer = useCallback((playerAnswer: string, fullAnswerObj: any) => {
    setShowQuestion(false);
    setShowHistory(true);
    updateStepAnswer(currentStep, fullAnswerObj);
    
    if (isSnakeLadderPosition(currentStep)) {
      console.log('Snake/Ladder Question Correct:', {
        step: currentStep,
        answer: playerAnswer
      });
      if (fullAnswerObj.decision === 'good') {
        climb();
        climb();
        climb();
        climb();
      } else {
        fall();
        fall();
      }
    }
  
    setRollHistory(prev => {
      const lastRollEntry = [...prev].reverse().find(entry => entry.type === 'roll');
      if (lastRollEntry) {
        return prev.map(entry => 
          entry === lastRollEntry 
            ? { ...entry, outcome: `${playerAnswer}` }
            : entry
        );
      }
      return prev;
    });
  }, [currentStep, climb]);
  
  // const handleWrongAnswer = useCallback((playerAnswer: string, correctAnswer: string, fullAnswerObj: any) => {
  //   setShowQuestion(false);
  //   setShowHistory(true);
  //   updateStepAnswer(currentStep, fullAnswerObj);
    
  //   if (isSnakeLadderPosition(currentStep)) {
  //     console.log('Snake/Ladder Question Wrong:', {
  //       step: currentStep,
  //       answer: playerAnswer
  //     });
  //     fall();
  //   } else {
  //     handleFallBack(currentStep);
  //     fall();
  // }
    
  // setRollHistory(prev => {
  //     const lastRollEntry = [...prev].reverse().find(entry => entry.type === 'roll');
  //     if (lastRollEntry) {
  //       return [
  //         ...prev.map(entry => 
  //           entry === lastRollEntry 
  //             ? { ...entry, outcome: `${playerAnswer}` }
  //             : entry
  //         ),
  //         {
  //           type: 'step',
  //           step: currentStep - 1,
  //           timestamp: new Date().toLocaleTimeString(),
  //           direction: 'backward'
  //         }
  //       ];
  //     }
  //     return prev;
  //   });
  // }, [fall, currentStep]);  

  const handleNewRoll = (entry: HistoryEntry) => {
    // Always add the entry to history first
    setRollHistory(prev => [...prev, entry]);

    // Then handle the timing for questions if it's a roll
    if (entry.type === 'roll' && entry.currentPosition !== undefined) {  
      // const delayInMs = (entry.roll * 800) + 100;
      
      // setTimeout(() => {
      //   setShowHistory(false);
      //   setQuestionKey(prev => prev + 1);
      //   setShowQuestion(true);
      // }, delayInMs);
      setShowHistory(false);
      setQuestionKey(prev => prev + 1);
      setShowQuestion(true);
    }
  };

  const isSnakeLadderPosition = useCallback((step: number): boolean => {
    return snakeLadderPositions.has(step);
  }, [snakeLadderPositions]);
  
  const handleAnalyzeGame = async () => {
    setIsLoading(true);
    try {
      const storedSession = localStorage.getItem('gameSession');
      const gameSession = storedSession ? JSON.parse(storedSession) : null;
      
      const response = await api.fetchFetchGameSession({
        sessionId: gameSession.sessionId,
        maxAge: 100
      });
      localStorage.clear()
      // Navigate to analyze page with the response data
      navigate('/analysis', { state: { analysisData: response } });
    } catch (error) {
      console.error('Error analyzing game:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  }

  const handleNewGame = async () => {
    navigate('/');
  }

  return (
    <>
      <div className="game-container">
        <div>
          <GameHistory 
            climb={climb}
            history={rollHistory} 
            currentStep={currentStep}
            onNewRoll={handleNewRoll}
            onUpdateNarrative={updateNarrativeWithScenarios}
            gameOver={gameOver}
            setGameOver={setGameOver}
          />
          {gameOver && (
            <div className="game-over-overlay">
              <div className="game-over-modal">
                <h2>Woohoo! Congratulations!</h2>
                <p>You lived a long life till 100!</p>
                {isLoading && <Loading />}
                <div className="game-over-buttons">
                  <button onClick={handleAnalyzeGame}>Analyze my life lived</button>
                  <button onClick={handleNewGame}>Live a new Life</button>
                </div>
              </div>
            </div>
          )}
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
              currentStep={currentStep}
              gameData={gameData}
              onCorrectAnswer={handleCorrectAnswer}
              // onWrongAnswer={handleWrongAnswer}
              onQuestionSet={(questionData) => updateStepQuestion(currentStep, questionData)}
              className={isSnakeLadderPosition(currentStep) ? 'snake-ladder' : ''}
            />
          ) : null}
        </div>
    </div>
    </>
    
  );
}

export default GamePlay;