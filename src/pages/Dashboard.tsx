import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Ups-and-Downs-logo.png';
import './Dashboard.css';
import { GameSession } from '../types/gameTypes';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

function Dashboard() {
  localStorage.clear()
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [gameSession, setGameSession] = useState<GameSession>({
    sessionId: '',
    playerId: '',
    playerName: '',
    narrative: '',
    steps: []
  });
  const { showToast } = useToast();

  const firstNames = [
    'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Mary', 
    'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 
    'Sarah', 'Karen', 'Nancy', 'Margaret', 'Lisa', 'Betty', 'Dorothy',
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
    'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
    'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
  ];

  const generateRandomNames = () => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    setGameSession(prev => ({
      ...prev,
      playerName: firstName
    }));
  };
  

  const generateRandomId = (length: number) => {
    return Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGameSession(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const startNewGame = () => {
    setShowForm(true);
    // Generate session and player IDs
    setGameSession(prev => ({
      ...prev,
      sessionId: generateRandomId(5),
      playerId: generateRandomId(7)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // localStorage.removeItem('gameSession')
      // Call API to create game session
  
      // Initialize game data structure
      const newGameSession: GameSession = {
        sessionId: gameSession.sessionId,
        playerId: gameSession.playerId,
        playerName: gameSession.playerName,
        narrative: '',
        steps: []
      };

      await api.createGameSession({
        gameSessionId: newGameSession.sessionId,
        id: newGameSession.playerId,
        name: newGameSession.playerName,
        eventDescription: `I am born to loving parents.`
      });
  
      // Store in localStorage
      localStorage.setItem('gameSession', JSON.stringify(newGameSession));
      
      // Navigate to game page
      navigate('/game');
    } catch (error) {
      console.error('Error creating game session:', error);
      showToast('Error creating game session', 'error');
    }
  };
  

  const navigateToAnalysis = () => {
    navigate('/analysis');
  };

  return (
    <div className="dashboard">
      <div className='logo-container'>
        <img src={logo} alt="Ups and Downs Logo" height="400px"/>
      </div>
      
      {!showForm ? (
        <div className="dashboard-buttons">
          <button onClick={startNewGame}>Play a New Game</button>
          <button onClick={navigateToAnalysis}>Analyze a Game</button>
        </div>
      ) : (
        <div className="game-setup-form">
          <h2>Game Session Setup</h2>
          <div className="session-info">
            <p>Session ID: {gameSession.sessionId}</p>
            <p>Player ID: {gameSession.playerId}</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                Player Name<br/><br/>
                <input 
                  type="text" 
                  name="playerName" 
                  value={gameSession.playerName}
                  onChange={handleInputChange}
                />
              </label>
            </div>
            <div className="form-actions">
              <button type="button" onClick={generateRandomNames}>
                Generate Random Names
              </button>
              <button type="submit">Start Game</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
//const gameData = JSON.parse(localStorage.getItem('gameData') || '{}');