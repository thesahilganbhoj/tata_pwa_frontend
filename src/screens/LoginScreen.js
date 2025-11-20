import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

export default function LoginScreen({ onLogin }) {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@tatatechnologies\.com$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const endpoint = "/api/auth/login";
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, ...(isLogin ? {} : { name }) }),
      });

      const data = await response.json();

      // If fetch succeeded but API returned an error status
      if (!response.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // At this point response.ok === true
      if (data.success) {
        // Call onLogin with user object (frontend state)
        if (typeof onLogin === "function") onLogin(data.user);

        // Redirect according to backend instruction
        if (data.redirectTo) {
          navigate(data.redirectTo);
        } else {
          // Fallback route
          navigate("/home");
        }
      } else {
        // API responded ok but success=false
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      setError("Failed to connect to server. Make sure backend is running.");
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#ffffff",
      fontFamily: "Segoe UI, Arial, sans-serif",
      padding: "20px",
    },
    logo: { width: "150px", marginBottom: "20px", maxWidth: "100%" },
    heading: { color: "#0072bc", marginBottom: "15px", fontSize: "28px", fontWeight: "600" },
    toggle: {
      marginBottom: "20px",
      cursor: "pointer",
      color: "#0072bc",
      textDecoration: "underline",
      fontSize: "14px",
    },
    form: { display: "flex", flexDirection: "column", width: "100%", maxWidth: "350px" },
    input: {
      marginBottom: "15px",
      padding: "12px",
      border: "1px solid #0072bc",
      borderRadius: "6px",
      fontSize: "16px",
      fontFamily: "inherit",
    },
    button: {
      backgroundColor: "#0072bc",
      color: "white",
      padding: "12px",
      border: "none",
      borderRadius: "6px",
      cursor: loading ? "not-allowed" : "pointer",
      fontSize: "16px",
      fontWeight: "600",
      opacity: loading ? 0.7 : 1,
      transition: "0.3s",
    },
    footer: { marginTop: "40px", color: "#888", fontSize: "12px" },
    error: {
      color: "#d32f2f",
      marginBottom: "15px",
      padding: "10px",
      background: "#ffebee",
      borderRadius: "6px",
      fontSize: "14px",
    },
  };

  return (
    <div style={styles.container}>
      <img src="/Logo/TTL.png" alt="Tata Technologies Logo" style={styles.logo} />
      <h2 style={styles.heading}>{isLogin ? "Login" : "Create account"}</h2>

      {error && <div style={styles.error}>{error}</div>}

      <form style={styles.form} onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            disabled={loading}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          disabled={loading}
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Loading..." : isLogin ? "Login" : "Create account"}
        </button>
      </form>

      {/* Toggle signup/login if you need it later */}
      {/* <div style={styles.toggle} onClick={() => !loading && setIsLogin(!isLogin)}>
        {isLogin ? "Create a new account" : "Already have an account? Login"}
      </div> */}

      <p style={styles.footer}>© 2025 Tata Technologies</p>
    </div>
  );
}
