import { Link } from "react-router-dom";
import { useGame } from "../GameContext.jsx";

function GuardedLink({ to, children, ...rest }) {
  const { isGameActive, setShowLeavePrompt, setNextPath } = useGame();

  const handleClick = (e) => {
    if (!isGameActive) return;
    e.preventDefault();
    setNextPath(to);
    setShowLeavePrompt(true);
  };

  return (
    <Link to={to} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}

export default GuardedLink;
