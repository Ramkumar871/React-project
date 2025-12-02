import { Navigate, useLocation } from "react-router-dom";
import { useGame } from "../GameContext.jsx";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useGame();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/signin"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;
