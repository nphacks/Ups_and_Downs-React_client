interface DetermineGoodOrBadDecisionPayload {
    snippet: string;
  }

interface AddEventAtAgePayload {
    gameSessionId: string;
    playerId: string;
    age: number;
    eventDescription: string;
  }
  
  interface AddSkillAtAgePayload {
    gameSessionId: string;
    playerId: string;
    age: number;
    skill: string;
    acquired: boolean;
  }
  
  interface AddActionAtAgePayload {
    gameSessionId: string;
    playerId: string;
    age: number;
    actionQuestion: string;
    actionDescription: string;
    tookAction: boolean;
    usedAnythingForAction: string;
    skill: string;
    skillUsed: boolean;
    object: string;
    objectUsed: boolean;
  }
  
  interface AddDecisionAtAgePayload {
    gameSessionId: string;
    playerId: string;
    age: number;
    decisionQuestion: string;
    decisionDescription: string;
    decisionMade: boolean;
    leadsTo: string;
    actionDescription: string;
    tookAction: boolean;
    skill: string;
    skillUsed: boolean;
    object: string;
    objectUsed: boolean;
  }
  
  interface AddSituationAtAgePayload {
    gameSessionId: string;
    playerId: string;
    age: number;
    situationQuestion: string;
    situationDescription: string;
    leadsTo: string;
    decisionDescription: string;
    decisionMade: boolean;
    actionDescription: string;
    tookAction: boolean;
    usedAnythingForAction: string;
    skill: string;
    skillUsed: boolean;
    object: string;
    objectUsed: boolean;
  }
  
  interface CreateGameSessionPayload {
    gameSessionId: string;
    id: string;
    name: string;
    eventDescription: string;
  }

  interface FetchGameSessionPayload {
    sessionId: string;
    maxAge: number;
  }


  interface AnalysisChatPayload {
    snippet: string;
  }