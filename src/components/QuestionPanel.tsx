import { useState } from 'react';
import './QuestionPanel.css';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface QuestionPanelProps {
  key: number;
  onCorrectAnswer: (answer: string) => void;  // Modified
  onWrongAnswer: (playerAnswer: string, correctAnswer: string) => void;  // Modified
}

export function QuestionPanel({ onCorrectAnswer, onWrongAnswer }: QuestionPanelProps) {
  // Sample questions - these should be loaded from an API or configuration
  const questions: Question[] = [
    {
      id: 1,
      text: "What is the capital of France?",
      options: ["London", "Paris", "Berlin", "Madrid"],
      correctAnswer: 1
    },
    {
      id: 2,
      text: "Which planet is known as the Red Planet?",
      options: ["Venus", "Jupiter", "Mars", "Saturn"],
      correctAnswer: 2
    },
    {
      id: 3,
      text: "What is the largest mammal in the world?",
      options: ["African Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
      correctAnswer: 1
    },
    {
      id: 4,
      text: "In which year did World War II end?",
      options: ["1943", "1944", "1945", "1946"],
      correctAnswer: 2
    },
    {
      id: 5,
      text: "What is the chemical symbol for gold?",
      options: ["Ag", "Au", "Fe", "Cu"],
      correctAnswer: 1
    }
  ];

  // Initialize with a random question
  const [currentQuestion] = useState<Question>(() => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
  });

  const handleAnswer = (selectedIndex: number) => {
    if (!currentQuestion) return;

    const playerAnswer = currentQuestion.options[selectedIndex];
    const correctAnswer = currentQuestion.options[currentQuestion.correctAnswer];
    
    if (selectedIndex === currentQuestion.correctAnswer) {
      onCorrectAnswer(playerAnswer);
    } else {
      onWrongAnswer(playerAnswer, correctAnswer);
    }
  };

  return (
    <div className="question-panel">
      {currentQuestion ? (
        <>
          <h3>{currentQuestion.text}</h3>
          <div className="options">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="option-button"
              >
                {option}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default QuestionPanel;