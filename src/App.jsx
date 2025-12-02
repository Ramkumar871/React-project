import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import BrickBreaker from "./games/BrickBreaker.jsx";
import FoodMemory from "./games/FoodMemory.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import GuardedLink from "./components/GuardedLink.jsx";
import { useGame } from "./GameContext.jsx";

function App() {
  const {
    showLeavePrompt,
    setShowLeavePrompt,
    nextPath,
    setNextPath,
    setIsGameActive,
    settings,
    setSettings,
    isAuthenticated,
    logout,
  } = useGame();
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  const handleConfirmLeave = () => {
    setShowLeavePrompt(false);
    setIsGameActive(false);
    if (nextPath) {
      navigate(nextPath);
      setNextPath(null);
    }
  };

  const handleCancelLeave = () => {
    setShowLeavePrompt(false);
    setNextPath(null);
  };

  const handleSettingsChange = (partial) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleLogoutClick = () => {
    const ok = window.confirm("Are you sure you want to log out?");
    if (!ok) return;
    logout();
  };

  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === "light" ? "dark" : "light",
    }));
  };

  return (
    <div className="page">
      <header className="header">
        <h1>Game Portal</h1>
        <nav className="nav">
          <GuardedLink to="/">Home</GuardedLink>
          <GuardedLink to="/brick-breaker">Brick Breaker</GuardedLink>
          <GuardedLink to="/memory">Food Memory</GuardedLink>
          {!isAuthenticated && <GuardedLink to="/signin">Sign In</GuardedLink>}
          {!isAuthenticated && <GuardedLink to="/signup">Sign Up</GuardedLink>}
        </nav>
        <button
          className="settings-btn"
          type="button"
          onClick={() => setShowSettings(true)}
        >
          Settings
        </button>
        <button
          className="settings-btn"
          type="button"
          onClick={toggleTheme}
          style={{ marginLeft: 8 }}
        >
          {settings.theme === "light" ? "Dark" : "Light"} Mode
        </button>
        {isAuthenticated && (
          <button
            className="settings-btn"
            type="button"
            onClick={handleLogoutClick}
            style={{ marginLeft: 8 }}
          >
            Logout
          </button>
        )}
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/brick-breaker" element={<BrickBreaker />} />
          <Route path="/memory" element={<FoodMemory />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </main>

      {showLeavePrompt && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Leave game?</h3>
            <p>Your current game is still running. Are you sure you want to leave?</p>
            <div className="modal-actions">
              <button onClick={handleCancelLeave}>Stay</button>
              <button onClick={handleConfirmLeave} className="btn-danger">
                Leave game
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Audio Settings</h3>

            <div className="settings-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) =>
                    handleSettingsChange({ soundEnabled: e.target.checked })
                  }
                />
                Enable sound effects & music
              </label>
            </div>

            <div className="settings-group">
              <label>
                Music volume: {Math.round(settings.musicVolume * 100)}%
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) =>
                    handleSettingsChange({
                      musicVolume: Number(e.target.value),
                    })
                  }
                />
              </label>
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowSettings(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
