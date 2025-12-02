import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useGame } from "../GameContext.jsx";
import brickBg from "../assets/audio/brick-bg.mp3";

const blockWidth = 100;
const blockHeight = 20;
const ballDiameter = 20;
const boardWidth = 560;
const boardHeight = 300;

const userStart = [230, 10];
const ballStart = [270, 40];

function createBlock(xAxis, yAxis, id) {
  return {
    id,
    bottomLeft: [xAxis, yAxis],
    bottomRight: [xAxis + blockWidth, yAxis],
    topRight: [xAxis + blockWidth, yAxis + blockHeight],
    topLeft: [xAxis, yAxis + blockHeight],
  };
}

const initialBlocks = [
  createBlock(10, 270, 0),
  createBlock(120, 270, 1),
  createBlock(230, 270, 2),
  createBlock(340, 270, 3),
  createBlock(450, 270, 4),
  createBlock(10, 240, 5),
  createBlock(120, 240, 6),
  createBlock(230, 240, 7),
  createBlock(340, 240, 8),
  createBlock(450, 240, 9),
  createBlock(10, 210, 10),
  createBlock(120, 210, 11),
  createBlock(230, 210, 12),
  createBlock(340, 210, 13),
  createBlock(450, 210, 14),
];

function BrickBreaker() {
  // Desktop-only flag (>= 768px)
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    // Set initial value on mount as well
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [blocks, setBlocks] = useState(initialBlocks);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");

  const [time, setTime] = useState(0);
  const [runTimer, setRunTimer] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  const userRef = useRef(null);
  const ballRef = useRef(null);
  const musicRef = useRef(null);

  const userPosition = useRef([...userStart]);
  const ballPosition = useRef([...ballStart]);
  const xDirection = useRef(-2);
  const yDirection = useRef(2);
  const timerId = useRef(null);
  const gameOver = useRef(false);

  const { setIsGameActive, nickname, settings } = useGame();
  const playerName = nickname || "Guest";

  // Background music
  useEffect(() => {
    const audio = new Audio(brickBg);
    audio.loop = true;
    audio.volume = settings.musicVolume;
    musicRef.current = audio;

    if (settings.soundEnabled) {
      audio.play().catch(() => {});
    }

    const handleVisibility = () => {
      if (!musicRef.current) return;
      if (document.visibilityState === "hidden") {
        musicRef.current.pause();
      } else if (settings.soundEnabled && !isPaused) {
        musicRef.current.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      audio.pause();
      musicRef.current = null;
      document.removeEventListener("visibilitychange", handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const audio = musicRef.current;
    if (!audio) return;

    audio.volume = settings.musicVolume;
    if (settings.soundEnabled && !isPaused) {
      if (audio.paused) {
        audio.play().catch(() => {});
      }
    } else {
      audio.pause();
    }
  }, [settings.soundEnabled, settings.musicVolume, isPaused]);

  const drawUser = () => {
    if (!userRef.current) return;
    userRef.current.style.left = `${userPosition.current[0]}px`;
    userRef.current.style.bottom = `${userPosition.current[1]}px`;
  };

  const drawBall = () => {
    if (!ballRef.current) return;
    ballRef.current.style.left = `${ballPosition.current[0]}px`;
    ballRef.current.style.bottom = `${ballPosition.current[1]}px`;
  };

  const changeDirection = () => {
    if (xDirection.current === 2 && yDirection.current === 2) {
      yDirection.current = -2;
      return;
    }
    if (xDirection.current === 2 && yDirection.current === -2) {
      xDirection.current = -2;
      return;
    }
    if (xDirection.current === -2 && yDirection.current === -2) {
      yDirection.current = 2;
      return;
    }
    if (xDirection.current === -2 && yDirection.current === 2) {
      xDirection.current = 2;
      return;
    }
  };

  const checkForCollisions = () => {
    const [ballX, ballY] = ballPosition.current;

    // Block collisions
    setBlocks((prevBlocks) => {
      let collided = false;
      const newBlocks = prevBlocks.filter((block) => {
        const hit =
          ballX > block.bottomLeft[0] &&
          ballX < block.bottomRight[0] &&
          ballY + ballDiameter > block.bottomLeft[1] &&
          ballY < block.topLeft[1];

        if (hit && !collided) {
          collided = true;
          return false;
        }
        return true;
      });

      if (collided) {
        changeDirection();
        setScore((s) => s + 1);
        if (newBlocks.length === 0) {
          setMessage("You Win!");
          gameOver.current = true;
          setRunTimer(false);
          clearInterval(timerId.current);
          setIsGameActive(false);
          setShowResult(true);
        }
      }

      return newBlocks;
    });

    // Wall collisions
    if (
      ballX >= boardWidth - ballDiameter ||
      ballX <= 0 ||
      ballY >= boardHeight - ballDiameter
    ) {
      changeDirection();
    }

    // Paddle collision
    const [userX, userY] = userPosition.current;
    if (
      ballX > userX &&
      ballX < userX + blockWidth &&
      ballY > userY &&
      ballY < userY + blockHeight
    ) {
      changeDirection();
    }

    // Bottom = game over
    if (ballY <= 0 && !gameOver.current) {
      setMessage("You lose!");
      gameOver.current = true;
      setRunTimer(false);
      clearInterval(timerId.current);
      setIsGameActive(false);
      setShowResult(true);
    }
  };

  const moveBall = () => {
    if (gameOver.current || isPaused) return;
    ballPosition.current[0] += xDirection.current * speedMultiplier;
    ballPosition.current[1] += yDirection.current * speedMultiplier;
    drawBall();
    checkForCollisions();
  };

  useEffect(() => {
    drawUser();
    drawBall();

    const handleKeyDown = (e) => {
      if (gameOver.current || isPaused) return;

      if (e.key === "ArrowLeft") {
        if (userPosition.current[0] > 0) {
          userPosition.current[0] -= 10;
          drawUser();
        }
      } else if (e.key === "ArrowRight") {
        if (userPosition.current[0] < boardWidth - blockWidth) {
          userPosition.current[0] += 10;
          drawUser();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    timerId.current = setInterval(moveBall, 30);
    setIsGameActive(true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearInterval(timerId.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, speedMultiplier]);

  useEffect(() => {
    if (!runTimer || isPaused) return;
    const id = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [runTimer, isPaused]);

  const handleReset = () => {
    clearInterval(timerId.current);
    setBlocks(initialBlocks);
    setScore(0);
    setMessage("");
    userPosition.current = [...userStart];
    ballPosition.current = [...ballStart];
    xDirection.current = -2;
    yDirection.current = 2;
    gameOver.current = false;

    setTime(0);
    setRunTimer(true);
    setIsPaused(false);
    setShowResult(false);
    setIsGameActive(true);

    drawUser();
    drawBall();
    timerId.current = setInterval(moveBall, 30);
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleSpeedChange = (e) => {
    setSpeedMultiplier(Number(e.target.value));
  };

  // If not desktop, show message instead of game
  if (!isDesktop) {
    return (
      <section className="mobile-blocker">
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Desktop Only</h3>
            <p>
              Brick Breaker is only available on desktop or larger screens for
              the best experience. Please use a device with a wider screen.
            </p>
            <div className="modal-actions">
              <Link to="/" className="btn-secondary">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2>Brick Breaker</h2>
      <div className="score-bar">
        <span>Player: {playerName}</span>
        <span>Score: {score}</span>
        <span>Time: {time}s</span>

        <span>
          Speed: {speedMultiplier.toFixed(1)}x
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={speedMultiplier}
            onChange={handleSpeedChange}
            style={{ marginLeft: "8px", verticalAlign: "middle" }}
          />
        </span>

        {message && <span className="message">{message}</span>}
        <button onClick={togglePause}>{isPaused ? "Resume" : "Pause"}</button>
        <button onClick={handleReset}>Restart</button>
      </div>

      <div className="grid" style={{ width: boardWidth, height: boardHeight }}>
        {blocks.map((block) => {
          const y = block.bottomLeft[1];
          let bg = "linear-gradient(120deg, #22c55e, #4ade80)";

          if (y === 270) {
            bg = "linear-gradient(120deg, #f97316, #facc15)";
          } else if (y === 240) {
            bg = "linear-gradient(120deg, #3b82f6, #22d3ee)";
          } else if (y === 210) {
            bg = "linear-gradient(120deg, #a855f7, #ec4899)";
          }

          return (
            <div
              key={block.id}
              className="block"
              style={{
                left: `${block.bottomLeft[0]}px`,
                bottom: `${block.bottomLeft[1]}px`,
                background: bg,
              }}
            />
          );
        })}
        <div className="user" ref={userRef} />
        <div className="ball" ref={ballRef} />
      </div>

      {showResult && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{message || "Game over"}</h3>
            <p>Player: {playerName}</p>
            <p>Score: {score}</p>
            <p>Time: {time}s</p>
            <div className="modal-actions">
              <button onClick={handleReset}>Play again</button>
              <Link to="/" className="btn-secondary">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default BrickBreaker;
