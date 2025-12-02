import { Link } from "react-router-dom";
import { useGame } from "../GameContext.jsx";

function Home() {
  const { nickname, isAuthenticated } = useGame();
  const playerName = nickname || "Guest";

  return (
    <main className="home">
      <h1 className="home-title">Select a Game</h1>
      <p className="home-subtitle">
        Current player: {playerName}
        {isAuthenticated ? " (signed in)" : " (playing as Guest)"}
      </p>

      <div className="home-grid">
        <Link to="/brick-breaker" className="game-card">
          <h2>Brick Breaker</h2>
          <p>Destroy all the blocks with the bouncing ball.</p>
          <button className="play-btn">Play</button>
        </Link>

        <Link to="/memory" className="game-card">
          <h2>Food Memory</h2>
          <p>Flip the cards and find all matching pairs.</p>
          <button className="play-btn">Play</button>
        </Link>
      </div>
    </main>
  );
}

export default Home;
