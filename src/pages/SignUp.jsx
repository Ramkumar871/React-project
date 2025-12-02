import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function SignUp() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { username, email, password } = form;

    if (!username || !email || !password) {
      setError("Please fill all fields.");
      return;
    }

    const userData = { username, email, password };

    try {
      window.localStorage.setItem("gp_user", JSON.stringify(userData));
    } catch {}

    const from = location.state?.from || null;
    navigate("/signin", {
      replace: true,
      state: { from, prefillEmail: email },
    });
  };

  return (
    <main className="auth-page">
      <h2>Create account</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Username
          <input
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            maxLength={20}
            required
          />
        </label>

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
            minLength={4}
            required
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="play-btn">
          Sign Up
        </button>
      </form>
    </main>
  );
}

export default SignUp;
