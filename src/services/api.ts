// src/services/api.ts

import { config } from "../config/config";

const BASE_URL = config.MODUS_API_URL; // or your backend URL
    
export const api = {
  determineGoodOrBadDecision: async (variables: DetermineGoodOrBadDecisionPayload): Promise<string> => {
      const query = `
        query DetermineGoodOrBadDecision($snippet: String!) {
          determineGoodOrBadDecision(snippet: $snippet)
        }
      `;

      const result = await makeGraphQLRequest(query, variables);
      return result.determineGoodOrBadDecision.toLowerCase();
  },

  addEventAtAge: async (variables: AddEventAtAgePayload): Promise<any> => {
    const query = `
      mutation AddEventAtAge(
        $gameSessionId: String!
        $playerId: String!
        $age: Int!
        $eventDescription: String!
      ) {
        addEventAtAge(
          gameSessionId: $gameSessionId
          playerId: $playerId
          age: $age
          eventDescription: $eventDescription
        )
      }
    `;

    return makeGraphQLRequest(query, variables);
  },
    
  addSkillAtAge: async (variables: AddSkillAtAgePayload): Promise<any> => {
    const query = `
      mutation AddSkillAtAge(
        $gameSessionId: String!
        $playerId: String!
        $age: Int!
        $skill: String!
        $acquired: Boolean!
      ) {
        addSkillAtAge(
          gameSessionId: $gameSessionId
          playerId: $playerId
          age: $age
          skill: $skill
          acquired: $acquired
        )
      }
    `;

    return makeGraphQLRequest(query, variables);
  },

  addActionAtAge: async (variables: AddActionAtAgePayload): Promise<any> => {
    const query = `
      mutation AddActionAtAge(
        $gameSessionId: String!
        $playerId: String!
        $age: Int!
        $actionQuestion: String!
        $actionDescription: String!
        $tookAction: Boolean!
        $usedAnythingForAction: String!
        $skill: String!
        $skillUsed: Boolean!
        $object: String!
        $objectUsed: Boolean!
      ) {
        addActionAtAge(
          gameSessionId: $gameSessionId
          playerId: $playerId
          age: $age
          actionQuestion: $actionQuestion
          actionDescription: $actionDescription
          tookAction: $tookAction
          usedAnythingForAction: $usedAnythingForAction
          skill: $skill
          skillUsed: $skillUsed
          object: $object
          objectUsed: $objectUsed
        )
      }
    `;

    return makeGraphQLRequest(query, variables);
  },

  addDecisionAtAge: async (variables: AddDecisionAtAgePayload): Promise<any> => {
    const query = `
      mutation AddDecisionAtAge(
        $gameSessionId: String!
        $playerId: String!
        $age: Int!
        $decisionQuestion: String!
        $decisionDescription: String!
        $decisionMade: Boolean!
        $leadsTo: String!
        $actionDescription: String!
        $tookAction: Boolean!
        $skill: String!
        $skillUsed: Boolean!
        $object: String!
        $objectUsed: Boolean!
      ) {
        addDecisionAtAge(
          gameSessionId: $gameSessionId
          playerId: $playerId
          age: $age
          decisionQuestion: $decisionQuestion
          decisionDescription: $decisionDescription
          decisionMade: $decisionMade
          leadsTo: $leadsTo
          actionDescription: $actionDescription
          tookAction: $tookAction
          skill: $skill
          skillUsed: $skillUsed
          object: $object
          objectUsed: $objectUsed
        )
      }
    `;

    return makeGraphQLRequest(query, variables);
  },

  addSituationAtAge: async (variables: AddSituationAtAgePayload): Promise<any> => {
    const query = `
      mutation AddSituationAtAge(
        $gameSessionId: String!
        $playerId: String!
        $age: Int!
        $situationQuestion: String!
        $situationDescription: String!
        $leadsTo: String!
        $decisionDescription: String!
        $decisionMade: Boolean!
        $actionDescription: String!
        $tookAction: Boolean!
        $usedAnythingForAction: String!
        $skill: String!
        $skillUsed: Boolean!
        $object: String!
        $objectUsed: Boolean!
      ) {
        addSituationAtAge(
          gameSessionId: $gameSessionId
          playerId: $playerId
          age: $age
          situationQuestion: $situationQuestion
          situationDescription: $situationDescription
          leadsTo: $leadsTo
          decisionDescription: $decisionDescription
          decisionMade: $decisionMade
          actionDescription: $actionDescription
          tookAction: $tookAction
          usedAnythingForAction: $usedAnythingForAction
          skill: $skill
          skillUsed: $skillUsed
          object: $object
          objectUsed: $objectUsed
        )
      }
    `;

    return makeGraphQLRequest(query, variables);
  },

  createGameSession: async (variables: CreateGameSessionPayload): Promise<any> => {
    
    const query = `
      mutation CreateGameSession(
        $gameSessionId: String!
        $id: String!
        $name: String!
        $eventDescription: String!
      ) {
        createGameSession(
          gameSessionId: $gameSessionId
          id: $id
          name: $name
          eventDescription: $eventDescription
        )
      }
    `;
    return makeGraphQLRequest(query, variables);
  },
  
  fetchFetchGameSession(variables: FetchGameSessionPayload): Promise<any> {
      const query = `
        query FetchGameSession($sessionId: String!, $maxAge: Int!) {
          fetchGameSession(sessionId: $sessionId, maxAge: $maxAge) {
              gamesession_id
              player_id
              player_name
              ages {
                age
                age_data
              }
              lifeSummary
            }
          }`;
  return makeGraphQLRequest(query, variables);
  }
};

async function makeGraphQLRequest(query: string, variables: any): Promise<any> {
  const response = await fetch(`${BASE_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}