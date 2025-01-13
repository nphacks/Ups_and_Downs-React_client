// Using useNavigate hook
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import './GameAnalysis.css';
import { api } from '../services/api';
import { cleanString, removeQuotes } from '../utils/GameUtils';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

export interface GameSessions {
  allGameSessionNodes: {
    gamesession_id: any;
    session: string;
  }[]
}

interface ChatMessage {
  gamesession_id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const TypingIndicator = () => (
  <div className="typing-indicator">
    <span></span>
    <span></span>
    <span></span>
  </div>
);

// Add this component at the top level of your file
const ChatMessage = ({ message }: { message: ChatMessage }) => (
  <div 
    style={{
      margin: '10px 0',
      textAlign: message.sender === 'user' ? 'right' : 'left',
      color: message.sender === 'user' ? '#0066cc' : '#333'
    }}
  >
    <div style={{
      background: message.sender === 'user' ? '#e6f3ff' : '#f0f0f0',
      padding: '8px 12px',
      borderRadius: '12px',
      display: 'inline-block',
      maxWidth: '70%',
      whiteSpace: 'pre-wrap'
    }}>
      {message.gamesession_id === 'loading' ? (
        <TypingIndicator />
      ) : (
        typeof message.text === 'string' ? 
          message.text.split('\\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < message.text.split('\\n').length - 1 && <br />}
            </React.Fragment>
          ))
          : message.text
      )}
    </div>
    <small style={{ display: 'block', marginTop: '4px' }}>
      {message.timestamp.toLocaleTimeString()}
    </small>
  </div>
);

function GameAnalysis() {
  const navigate = useNavigate();

  const [gameSessions, setGameSessions] = useState<GameSessions['allGameSessionNodes']>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({});

  // Fetch game sessions (mock data for now)
  useEffect(() => {
    fetchSessions();
    
  }, []);

  const fetchSessions = async () => {
    const sessions: GameSessions = await api.allGameSessions();
    setGameSessions(sessions.allGameSessionNodes);
}

  const navigateToHome = () => {
    navigate('/');
  };

  const handleSessionClick = (sessionData: any) => {
    setSelectedSession(sessionData);
    let session = sessionData;
    
    // Function to extract summary from session_data
    const extractSummary = (sessionData: string) => {
      const marker = "... The summary for this game will begin from here ...";
      const summaryIndex = sessionData.indexOf(marker);
      
      if (summaryIndex !== -1) {
        // Get everything after the marker phrase
        return sessionData.substring(summaryIndex + marker.length).trim();
      }
      // Return the whole session data if marker isn't found
      return sessionData;
    };
  
    // Load existing chat history or initialize with bot's first message
    if (chatHistory[sessionData.gamesession_id]) {
      setChatMessages(chatHistory[sessionData.gamesession_id]);
    } else {
      const summary = cleanString(extractSummary(session.session_data));
      const initialMessage: ChatMessage = {
        gamesession_id: session.gamesession_id,
        text: summary,
        sender: 'bot',
        timestamp: new Date()
      };
  
      setChatMessages([initialMessage]);
      setChatHistory(prev => ({
        ...prev,
        [sessionData.gamesession_id]: [initialMessage]
      }));
    }
  };  

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedSession) return;

    const userMessage: ChatMessage = {
      gamesession_id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    const messagesWithUser = [...chatMessages, userMessage];
    setChatMessages(messagesWithUser);

    setNewMessage('');

    const loadingMessage: ChatMessage = {
      gamesession_id: 'loading',
      text: '...',
      sender: 'bot',
      timestamp: new Date()
    };
    setChatMessages([...messagesWithUser, loadingMessage]);

    try {
      // Format conversation history
      const snippet = messagesWithUser
        .map(msg => `${msg.sender === 'bot' ? 'Bot' : 'User'}: ${msg.text}`)
        .join('\n');
  
      // Send to API and get response
      const botResponse: any = await api.analysisChat({snippet});
      console.log(botResponse)
      // Create bot message with API response
      const botMessage: ChatMessage = {
        gamesession_id: Date.now().toString(),
        text: botResponse.analysisChat,
        sender: 'bot',
        timestamp: new Date()
      };
  
      // Update messages (remove loading message and add real response)
      const updatedMessages = [...messagesWithUser, botMessage];
      setChatMessages(updatedMessages);
      
      // Update chat history
      setChatHistory(prev => ({
        ...prev,
        [selectedSession]: updatedMessages
      }));
  
    } catch (error) {
      
      const errorMessage: ChatMessage = {
        gamesession_id: Date.now().toString(),
        text: "Sorry, I couldn't process your message. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      const updatedMessages = [...messagesWithUser, errorMessage];
      setChatMessages(updatedMessages);
      setChatHistory(prev => ({
        ...prev,
        [selectedSession]: updatedMessages
      }));
    }
  };

  return (
    <div className="game-analysis-container" style={{ display: 'flex', height: '100vh' }}>
      {/* Left Side - Game Sessions */}
      <div className="sessions-panel" style={{ flex: '0 0 450px' }}>
        <h2 style={{ paddingLeft: '18px' }}>Game Sessions</h2>
        <div className="sessions-list">
            {gameSessions?.map((session, index) => {
            return (
              <div 
                key={`session-${session.gamesession_id}-${index}`} // More specific key
                className={`session-item ${selectedSession === session.gamesession_id ? 'selected' : ''}`}
                onClick={() => handleSessionClick(session)}
                style={{
                  cursor: 'pointer',
                  padding: '10px',
                  margin: '5px',
                  width: '150px',
                  border: '1px solid #ddd',
                  backgroundColor: selectedSession === session.gamesession_id ? '#e6f3ff' : 'white'
                }}
              >
                {/* Add some content to make sure the div isn't empty */}
                <span>Session {removeQuotes(session.gamesession_id)}</span>
              </div>
            );
          })}
        </div>
        <button 
          className="new-game-button"
          onClick={navigateToHome}
        >
          Home
        </button>
      </div>

      {/* Right Side - Chat Bot */}
      <div className="chat-panel" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2>Game Analysis Chat</h2>
        <div className="chat-messages" style={{ 
            flex: 1, 
            overflowY: 'auto',
            marginBottom: '20px',
            border: '1px solid #eee',
            padding: '10px'
          }}>
            <TransitionGroup>
              {chatMessages.map(message => (
                <CSSTransition
                  key={message.gamesession_id}
                  timeout={300}
                  classNames="message"
                >
                  <ChatMessage message={message} />
                </CSSTransition>
              ))}
            </TransitionGroup>
          </div>
        <div className="chat-input" style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Discuss about your game performance..."
            style={{ flex: 1, padding: '8px' }}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default GameAnalysis;
