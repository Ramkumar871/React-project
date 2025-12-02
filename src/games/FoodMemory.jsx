// src/games/FoodMemory.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useGame } from "../GameContext.jsx";

import friesImg from "../assets/images/fries.png";
import cheeseburgerImg from "../assets/images/cheeseburger.png";
import iceCreamImg from "../assets/images/ice-cream.png";
import pizzaImg from "../assets/images/pizza.png";
import milkshakeImg from "../assets/images/milkshake.png";
import hotdogImg from "../assets/images/hotdog.png";
import blankImg from "../assets/images/blank.png";
import whiteImg from "../assets/images/white.png";
import memoryBg from "../assets/audio/memory-bg.mp3";

const baseCards = [
  { name: "fries", img: friesImg },
  { name: "cheeseburger", img: cheeseburgerImg },
  { name: "ice-cream", img: iceCreamImg },
  { name: "pizza", img: pizzaImg },
  { name: "milkshake", img: milkshakeImg },
  { name: "hotdog", img: hotdogImg },
  { name: "fries", img: friesImg },
  { name: "cheeseburger", img: cheeseburgerImg },
  { name: "ice-cream", img: iceCreamImg },
  { name: "pizza", img: pizzaImg },
  { name: "milkshake", img: milkshakeImg },
  { name: "hotdog", img: hotdogImg },
];

function shuffle(array) {
  return [...array].sort(() => 0.5 - Math.random());
}

function FoodMemory() {
  const [cards, setCards] = useState(
    shuffle(
      baseCards.map((card, index) => ({
        ...card,
        id: index,
      }))
    )
  );
  const [cardsChosen, setCardsChosen] = useState([]);
  const [cardsChosenIds, setCardsChosenIds] = useState([]);
  const [cardsWon, setCardsWon] = useState([]);
  const [resultText, setResultText] = useState("0");

  const [time, setTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const { setIsGameActive, nickname, settings } = useGame();
  const playerName = nickname || "Guest";
  const musicRef = useRef(null);

  // Background music
  useEffect(() => {
    const audio = new Audio(memoryBg);
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

  // React to audio settings and pause
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

  useEffect(() => {
    setIsGameActive(true);
  }, [setIsGameActive]);

  // Timer
  useEffect(() => {
    if (isFinished || isPaused) return;
    const id = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isFinished, isPaused]);

  const handleCardClick = (index) => {
    if (isFinished || isPaused) return;
    if (cardsChosenIds.length === 2) return;
    if (cardsChosenIds.includes(index)) return;
    if (isMatched(index)) return;

    const clickedCard = cards[index];
    const newChosen = [...cardsChosen, clickedCard.name];
    const newChosenIds = [...cardsChosenIds, index];

    setCardsChosen(newChosen);
    setCardsChosenIds(newChosenIds);

    if (newChosen.length === 2) {
      setTimeout(() => checkForMatch(newChosen, newChosenIds), 500);
    }
  };

  const checkForMatch = (chosen, chosenIds) => {
    const [firstId, secondId] = chosenIds;

    setCardsWon((prev) => {
      let updated = prev;

      if (firstId !== secondId && chosen[0] === chosen[1]) {
        updated = [...prev, chosenIds];
      }

      const matchedPairs = updated.length;
      if (matchedPairs === baseCards.length / 2) {
        setResultText("Congratulations! You found them all!");
        setIsFinished(true);
        setIsGameActive(false);
        setShowResult(true);
      } else {
        setResultText(String(matchedPairs));
      }

      return updated;
    });

    setCardsChosen([]);
    setCardsChosenIds([]);
  };

  const isMatched = (index) => {
    return cardsWon.some((pair) => pair[0] === index || pair[1] === index);
  };

  const isFlipped = (index) => {
    return cardsChosenIds.includes(index);
  };

  const handleReset = () => {
    setCards(
      shuffle(
        baseCards.map((card, index) => ({
          ...card,
          id: index,
        }))
      )
    );
    setCardsChosen([]);
    setCardsChosenIds([]);
    setCardsWon([]);
    setResultText("0");
    setTime(0);
    setIsFinished(false);
    setIsPaused(false);
    setShowResult(false);
    setIsGameActive(true);
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  return (
    <section>
      <h2>Food Memory Game</h2>
      <div className="score-bar">
        <span>Player: {playerName}</span>
        <span>
          Score: <span id="result">{resultText}</span>
        </span>
        <span>Time: {time}s</span>
        <button onClick={togglePause}>
          {isPaused ? "Resume" : "Pause"}
        </button>
        <button onClick={handleReset}>Restart</button>
      </div>

      <div className="card-grid">
        {cards.map((card, index) => {
          let src = blankImg;
          if (isMatched(index)) {
            src = whiteImg;
          } else if (isFlipped(index)) {
            src = card.img;
          }

          return (
            <img
              key={card.id + "-" + index}
              src={src}
              alt={card.name}
              onClick={() => handleCardClick(index)}
              className="card"
            />
          );
        })}
      </div>

      {showResult && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>All pairs found!</h3>
            <p>Player: {playerName}</p>
            <p>Score: {cardsWon.length}</p>
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

export default FoodMemory;
