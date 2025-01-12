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

function GameAnalysis() {
  const navigate = useNavigate();
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

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

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simulate bot response (replace with actual API call)
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm analyzing your game performance...",
        sender: 'bot',
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleSessionClick = (sessionId: string) => {
    // Add a bot message indicating analysis of the selected session
    const botMessage: ChatMessage = {
      id: Date.now().toString(),
      text: `Analyzing session ${sessionId}. What would you like to know about this game?`,
      sender: 'bot',
      timestamp: new Date(),
    };
    setChatMessages([botMessage]); // Reset chat with initial message
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
              className="session-item"
              onClick={() => handleSessionClick(session.id)}
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
              <div>{message.text}</div>
              <small>{message.timestamp.toLocaleTimeString()}</small>
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
