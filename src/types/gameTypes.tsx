// src/types/gameTypes.ts
export interface GameDataContent {
    scenarios: string[];
    questions?: {
      type: string;
      question: string;
      decision: string;
      action: string;
      object?: string;
      answerType: string;
      answer: {
        tookDecision: boolean;
        decisionStrength: number;
        tookAction: boolean;
        actionStrength: number;
        actionDescription: string;
        withObject?: boolean;
        objectStrength?: number;
      }[];
    }[];
}

// interface GameStep {
//   age: number;
//   narrative: string;
//   question?: {
//     questionData: any;
//     selectedAnswer: any;
//   };
// }

export interface GameSession {
  sessionId: string;
  playerId: string;
  playerName: string;
  steps: StepData[];
  narrative: string; 
}

export interface StepData {
  stepNumber: number;
  age: number;  // Add this
  scenarios: string[];
  question?: {
    questionData: any; // Reference the question type from existing interface
    selectedAnswer: any; // Reference the answer type
  };
}

  