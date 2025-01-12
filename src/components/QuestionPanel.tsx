import { useEffect, useRef, useState } from 'react';
import './QuestionPanel.css';
import { capitalizeFirstLetter } from '../utils/GameUtils';
import { api } from '../services/api';


interface QuestionPanelProps {
  currentStep: number;
  gameData: any[];
  onCorrectAnswer: (answer: string, fullAnswerObj: any) => void;
  onWrongAnswer: (playerAnswer: string, correctAnswer: string, fullAnswerObj: any) => void;
  onQuestionSet: (questionData: any) => void;
  isSnakeLadder?: boolean;
  className?: string;
}

export function QuestionPanel({ 
  currentStep, 
  gameData, 
  onCorrectAnswer, 
  onWrongAnswer,
  onQuestionSet,
  className 
}: QuestionPanelProps) {
  
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const hasSetQuestion = useRef(false);

  const handleAnswer = async (answer: string, fullAnswerObj: any) => {
    // Check if this is a snake/ladder question
    if (className?.includes('snake-ladder')) {
      try {
        const narrative = fullAnswerObj[currentQuestion.answerType];
        const decision = await api.determineGoodOrBadDecision({snippet: narrative});
        
        // Pass the decision along with the answer
        onCorrectAnswer(answer, {
          ...fullAnswerObj,
          decision: decision
        });
      } catch (error) {
        console.error('Error processing snake/ladder answer:', error);
      }
    } else {
      // For regular questions, just pass the answer through
      onCorrectAnswer(answer, fullAnswerObj);
    }
  };

  useEffect(() => {
    // Only set the question once when the component mounts
    if (!hasSetQuestion.current && gameData[currentStep]?.questions) {
      const questions = gameData[currentStep].questions;
      
      // Filter questions based on whether it's a snake/ladder position
      const isSnakeLadder = className?.includes('snake-ladder');
      const eligibleQuestions = questions.filter((q: any) => 
        isSnakeLadder 
          ? q.questionType === "snake/ladder"
          : q.questionType !== "snake/ladder"
      );

      // If no eligible questions, fallback to all questions
      const questionPool = eligibleQuestions.length > 0 ? eligibleQuestions : questions;
      
      const randomIndex = Math.floor(Math.random() * questionPool.length);
      const questionData = questionPool[randomIndex];
      
      setCurrentQuestion(questionData);
      onQuestionSet(questionData);
      hasSetQuestion.current = true;
    }
  }, [currentStep, gameData, onQuestionSet, className]);

  if (!currentQuestion) return null;

  

  return (
    <div className={`question-panel ${className}`.trim()}>
    <div className="question-panel">
      <h3>{currentQuestion.question}</h3>
      <div className="options">
        {currentQuestion.answer.map((option: any, index: number) => (
          <button
            key={index}
            onClick={() => handleAnswer(
              option[currentQuestion.answerType], 
              option
            )}
            className="option-button"
          >
            {capitalizeFirstLetter(option[currentQuestion.answerType])}
          </button>
        ))}
      </div>
    </div>
  </div>
  );
}

export default QuestionPanel;
