import { useEffect, useRef, useState } from 'react';
import './QuestionPanel.css';
// import gameData from '../data/GameData.json';

// interface Answer {
//   tookDecision?: boolean;
//   decisionStrength?: number;
//   tookAction?: boolean;
//   actionStrength?: number;
//   actionDescription?: string;
//   withObject?: boolean;
//   objectStrength?: number;
//   action?: string;
//   decision?: string;
//   [key: string]: any;
// }

// interface Question {
//   type: string;
//   question: string;
//   answerType: string;
//   answer: Answer[];
//   decision?: string;
//   action?: string;
//   object?: string;
//   situation?: string;
//   situtation?: string; // Note: including both spellings in case of typo in data
//   [key: string]: any; // Allow any additional properties
// }

interface QuestionPanelProps {
  currentStep: number;
  gameData: any[];
  onCorrectAnswer: (answer: string, fullAnswerObj: any) => void;
  onWrongAnswer: (playerAnswer: string, correctAnswer: string, fullAnswerObj: any) => void;
  onQuestionSet: (questionData: any) => void;
}

export function QuestionPanel({ 
  currentStep, 
  gameData, 
  onCorrectAnswer, 
  onWrongAnswer,
  onQuestionSet 
}: QuestionPanelProps) {
  
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const hasSetQuestion = useRef(false);

  useEffect(() => {
    // Only set the question once when the component mounts
    if (!hasSetQuestion.current && gameData[currentStep]?.questions) {
      const questions = gameData[currentStep].questions;
      const randomIndex = Math.floor(Math.random() * questions.length);
      const questionData = questions[randomIndex];
      
      setCurrentQuestion(questionData);
      onQuestionSet(questionData);
      hasSetQuestion.current = true;
    }
  }, [currentStep, gameData, onQuestionSet]);

  if (!currentQuestion) return null;

  // const getAnswerText = (answer: Answer) => {
  //   // Get the answer based on the answerType
  //   const text = answer[currentQuestion.answerType] ?? '';
  //   // Capitalize first letter
  //   return text.charAt(0).toUpperCase() + text.slice(1);
  // };

  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="question-panel">
      <h3>{currentQuestion.question}</h3>
      <div className="options">
        {currentQuestion.answer.map((option: any, index: number) => (
          <button
            key={index}
            onClick={() => onCorrectAnswer(option[currentQuestion.answerType], option)}
            className="option-button"
          >
            {capitalizeFirstLetter(option[currentQuestion.answerType])}
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuestionPanel;
