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

export interface GameSession {
  sessionId: string;
  playerId: string;
  playerName: string;
  fatherName: string;
  motherName: string;
  steps: StepData[];
}

export interface StepData {
  stepNumber: number;
  scenarios: string[];
  question?: {
    questionData: any; // Reference the question type from existing interface
    selectedAnswer: any; // Reference the answer type
  };
}

  