// Using useNavigate hook
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './GameAnalysis.css';

interface GameSession {
  id: string;
  startTime: Date;
  duration: number;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Dummy data for game sessions
const dummyGameSessions: GameSession[] = [
  {
    id: '1',
    startTime: new Date('2024-01-15T10:00:00'),
    duration: 300
  },
  {
    id: '2',
    startTime: new Date('2024-01-16T15:30:00'),
    duration: 450
  }
];

type BotResponsesType = {
  [key: string]: string[]
}

// Dummy responses from the analysis bot
const botResponses: BotResponsesType = {
  '1': [
    "I noticed you struggled with resource management in the early game.",
    "Your decision making improved significantly in the mid-game phase.",
    "Would you like specific tips on improving your early game strategy?"
  ],
  '2': [
    "Your performance in this session showed great improvement!",
    "I noticed you made better strategic decisions compared to previous games.",
    "Would you like to discuss any specific aspects of this session?"
  ]
};


function GameAnalysis() {
  const navigate = useNavigate();

  const [gameSessions, setGameSessions] = useState<GameSession[]>(dummyGameSessions);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({});

  // Fetch game sessions (mock data for now)
  useEffect(() => {
    // Replace this with actual API call
    const mockSessions = [
      { id: '1', startTime: new Date(), duration: 300 },
      { id: '2', startTime: new Date(Date.now() - 86400000), duration: 450 },
      
    ];
    setGameSessions(mockSessions);
  }, []);

  const navigateToHome = () => {
    navigate('/');
  };

  const handleSessionClick = (sessionId: string) => {
    setSelectedSession(sessionId);
    
    // Load existing chat history or initialize with bot's first message
    if (chatHistory[sessionId]) {
      setChatMessages(chatHistory[sessionId]);
    } else {
      const initialMessage: ChatMessage = {
        id: Date.now().toString(),
        text: botResponses[sessionId][0],
        sender: 'bot',
        timestamp: new Date()
      };
      setChatMessages([initialMessage]);
      setChatHistory(prev => ({
        ...prev,
        [sessionId]: [initialMessage]
      }));
    }
  };

  // Handle sending messages
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedSession) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    // Get random bot response
    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: botResponses[selectedSession][Math.floor(Math.random() * botResponses[selectedSession].length)],
      sender: 'bot',
      timestamp: new Date()
    };

    const updatedMessages = [...chatMessages, userMessage, botMessage];
    setChatMessages(updatedMessages);
    
    setChatHistory(prev => ({
      ...prev,
      [selectedSession]: updatedMessages
    }));

    setNewMessage('');
  };

  return (
    <div className="game-analysis-container" style={{ display: 'flex', height: '100vh' }}>
      {/* Left Side - Game Sessions */}
      <div className="sessions-panel">
        <h2>Game Sessions</h2>
        <div className="sessions-list">
          {gameSessions.map(session => (
            <div 
              key={session.id} 
              className={`session-item ${selectedSession === session.id ? 'selected' : ''}`}
              onClick={() => handleSessionClick(session.id)}
              style={{
                cursor: 'pointer',
                padding: '10px',
                margin: '5px',
                border: '1px solid #ddd',
                backgroundColor: selectedSession === session.id ? '#e6f3ff' : 'white'
              }}
            >
              <div className="session-date">
                Date: {session.startTime.toLocaleDateString()}
              </div>
              <div className="session-time">
                Time: {session.startTime.toLocaleTimeString()}
              </div>
              <div className="session-duration">
                Duration: {Math.floor(session.duration / 60)}m {session.duration % 60}s
              </div>
            </div>
          ))}
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
          {chatMessages.map(message => (
            <div 
              key={message.id} 
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
                maxWidth: '70%'
              }}>
                {message.text}
              </div>
              <small style={{ display: 'block', marginTop: '4px' }}>
                {message.timestamp.toLocaleTimeString()}
              </small>
            </div>
          ))}
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
