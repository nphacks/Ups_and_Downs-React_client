// Using Link component
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Ups-and-Downs-logo.png';

function Dashboard() {
    const navigate = useNavigate();
    
    const navigateToGame = () => {
        navigate('/game');
      };
    
      const navigateToAnalysis = () => {
        navigate('/analysis');
      };
  return (
    <div>
      <div><img src={logo} alt="Ups and Downs Logo" height={"250px"}/></div>
      <button onClick={navigateToGame}>Play a New Game</button>
      <button onClick={navigateToAnalysis}>Analyze a Game</button>
      <form>
            <label>
                Player Name: <input type="text" name="playername" />
            </label>
            <label>
                Father Name: <input type="text" name="fathername" />
            </label>
            <label>
                Mother Name: <input type="text" name="mothername" />
            </label>
            <input type="submit" value="Submit" />
        </form>
    </div>
  );
}

export default Dashboard;
