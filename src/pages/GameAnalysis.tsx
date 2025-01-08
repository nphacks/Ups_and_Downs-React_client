// Using useNavigate hook
import { useNavigate } from 'react-router-dom';

function GameAnalyis() {
  const navigate = useNavigate();

  const navigateToGame = () => {
    navigate('/game');
  };

  return (
    <div>
      <h1>Game Analysis</h1>
      <button onClick={navigateToGame}>New Game</button>
    </div>
  );
}

export default GameAnalyis;