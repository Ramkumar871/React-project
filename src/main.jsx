import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./App.css";
import { GameProvider } from "./GameContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <GameProvider>
        <App />
      </GameProvider>
    </HashRouter>
  </React.StrictMode>
);
