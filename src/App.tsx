import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Game from './pages/Game';
import GameAnalysis from './pages/GameAnalysis';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/game" element={<Game />} />
          <Route path="/analysis" element={<GameAnalysis />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
