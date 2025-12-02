import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGame } from "../GameContext.jsx";

function SignIn() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { setNickname, setUser } = useGame();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    const prefillEmail = location.state?.prefillEmail;
    if (prefillEmail) {
      setForm((f) => ({ ...f, email: prefillEmail }));
    }
  }, [location.state]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { email, password } = form;

    let stored;
    try {
      const raw = window.localStorage.getItem("gp_user");
      stored = raw ? JSON.parse(raw) : null;
    } catch {
      stored = null;
    }

    if (!stored) {
      setError("No account found. Please sign up first.");
      return;
    }

    if (stored.email !== email || stored.password !== password) {
      setError("Email or password is incorrect.");
      return;
    }

    setUser(stored);
    setNickname(stored.username);
    const from = location.state?.from?.pathname || "/";
    navigate(from, { replace: true });
  };

  return (
    <main className="auth-page">
      <h2>Sign in</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="play-btn">
          Sign In
        </button>
      </form>
    </main>
  );
}

export default SignIn;
