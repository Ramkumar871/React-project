import { createContext, useContext, useEffect, useState } from "react";

const GameContext = createContext(null);

const defaultSettings = {
  soundEnabled: true,
  musicVolume: 0.7,
  theme: "light", // default light mode
};

export function GameProvider({ children }) {
  const [isGameActive, setIsGameActive] = useState(false);
  const [showLeavePrompt, setShowLeavePrompt] = useState(false);
  const [nextPath, setNextPath] = useState(null);

  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem("gp_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [nickname, setNickname] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      const storedNick = window.localStorage.getItem("gp_nickname");
      if (storedNick) return storedNick;
      const rawUser = window.localStorage.getItem("gp_user");
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        return parsed.username || "";
      }
      return "";
    } catch {
      return "";
    }
  });

  const [settings, setSettings] = useState(() => {
    if (typeof window === "undefined") return defaultSettings;
    try {
      const stored = window.localStorage.getItem("gp_settings");
      if (!stored) return defaultSettings;
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    } catch {
      return defaultSettings;
    }
  });

  const isAuthenticated = !!user;

  useEffect(() => {
    try {
      if (nickname) {
        window.localStorage.setItem("gp_nickname", nickname);
      } else {
        window.localStorage.removeItem("gp_nickname");
      }
    } catch {}
  }, [nickname]);

  useEffect(() => {
    try {
      if (user) {
        window.localStorage.setItem("gp_user", JSON.stringify(user));
      } else {
        window.localStorage.removeItem("gp_user");
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      window.localStorage.setItem("gp_settings", JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Apply light/dark theme to body
  useEffect(() => {
    const body = document.body;
    const themeClass =
      settings.theme === "dark" ? "theme-dark" : "theme-light";
    body.classList.remove("theme-dark", "theme-light");
    body.classList.add(themeClass);
  }, [settings.theme]); // standard theme toggle pattern [web:192]

  const logout = () => {
    setUser(null);
    setNickname("");
    setIsGameActive(false);
    try {
      window.localStorage.removeItem("gp_user");
      window.localStorage.removeItem("gp_nickname");
    } catch {}
  };

  const value = {
    isGameActive,
    setIsGameActive,
    showLeavePrompt,
    setShowLeavePrompt,
    nextPath,
    setNextPath,
    user,
    setUser,
    isAuthenticated,
    nickname,
    setNickname,
    settings,
    setSettings,
    logout,
  };

  return (
    <GameContext.Provider value={value}>{children}</GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
