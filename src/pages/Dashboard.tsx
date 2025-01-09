import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Ups-and-Downs-logo.png';
import './Dashboard.css';
import { GameSession } from '../types/GameTypes';

function Dashboard() {
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [gameSession, setGameSession] = useState<GameSession>({
      sessionId: '',
      playerId: '',
      playerName: '',
      fatherName: '',
      motherName: '',
      steps: []
    });

    const firstNames = [
      'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Mary', 
      'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 
      'Sarah', 'Karen', 'Nancy', 'Margaret', 'Lisa', 'Betty', 'Dorothy'
    ];

    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
      'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
      'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
    ];

    const generateRandomName = () => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      return `${firstName} ${lastName}`;
    };

    const generateRandomId = (length: number) => {
      return Math.floor(Math.random() * Math.pow(10, length))
        .toString()
        .padStart(length, '0');
    };

    const generateRandomNames = () => {
      setGameSession(prev => ({
        ...prev,
        playerName: generateRandomName(),
        fatherName: generateRandomName(),
        motherName: generateRandomName()
      }));
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

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      /// Initialize game data structure
      const newGameSession: GameSession = {
        sessionId: gameSession.sessionId,
        playerId: gameSession.playerId,
        playerName: gameSession.playerName,
        fatherName: gameSession.fatherName,
        motherName: gameSession.motherName,
        steps: []
      };

      // Store in localStorage
      localStorage.setItem('gameSession', JSON.stringify(newGameSession));
      navigate('/game');
        };

    const navigateToAnalysis = () => {
      navigate('/analysis');
    };

    return (
      <div className="dashboard">
        <div>
          <img src={logo} alt="Ups and Downs Logo" height="250px"/>
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
                  Player Name:
                  <input 
                    type="text" 
                    name="playerName" 
                    value={gameSession.playerName}
                    onChange={handleInputChange}
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  Father Name:
                  <input 
                    type="text" 
                    name="fatherName"
                    value={gameSession.fatherName}
                    onChange={handleInputChange}
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  Mother Name:
                  <input 
                    type="text" 
                    name="motherName"
                    value={gameSession.motherName}
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