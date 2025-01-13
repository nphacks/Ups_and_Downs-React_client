import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Game from './pages/Game';
import GameAnalysis from './pages/GameAnalysis';
import { ToastProvider, useToast } from './context/ToastContext';
import { useEffect } from 'react';

const PrivateRoute = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const gameSession = localStorage.getItem('gameSession');
    let isValid = false;
    
    try {
      const parsedSession = JSON.parse(gameSession || '');
      isValid = parsedSession && Object.keys(parsedSession).length > 0;
    } catch {
      isValid = false;
    }

    if (!isValid) {
      showToast('Please start a new game from the dashboard', 'error');
      navigate('/');
    }
  }, [navigate, showToast]);

  return <Game />;
};

function App() {
  localStorage.clear()
  return (
    <ToastProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/game" element={<PrivateRoute />} />
            <Route path="/analysis" element={<GameAnalysis />} />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
