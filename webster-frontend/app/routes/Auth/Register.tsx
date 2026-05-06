import { useState } from "react";
import { Link, useNavigate } from 'react-router';
import { GoogleIcon } from '../../assets/Icons';
import "./Login.css";

const GOOGLE_CLIENT_ID = import.meta.env?.VITE_GOOGLE_CLIENT_ID;
const API = import.meta.env?.VITE_API;

function signUpWithGoogle() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: import.meta.env?.VITE_REDIRECT_URI ?? window.location.origin + "/auth/callback",
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export default function RegisterPage() {
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password, passwordConfirmation: confirm }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.message || "Registration failed.");
      } else {
        navigate('/verify-email');
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputBase = (field: string): React.CSSProperties => ({
    width: "100%",
    padding: "13px 16px",
    fontSize: 14,
    fontWeight: 400,
    color: "#1a1a1a",
    background: focusedField === field ? "#fff" : "#f4f4f4",
    border: focusedField === field ? "1.5px solid #7ec8e3" : "1.5px solid #e0e0e0",
    borderRadius: 10,
    outline: "none",
    transition: "all 0.18s ease",
    boxSizing: "border-box" as const,
    fontFamily: "'Elms Sans', 'DM Sans', sans-serif",
  });

  const eyeButtonStyle: React.CSSProperties = {
    position: "absolute", right: 14, top: "50%",
    transform: "translateY(-50%)",
    background: "none", border: "none",
    cursor: "pointer", color: "#aaa", padding: 2,
    display: "flex", alignItems: "center",
  };

  const EyeOpen = () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOff = () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
    </svg>
  );

  return (
    <div className="wraper-page">
      <main className="auth-main">
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          padding: "36px 36px 48px",
          margin: '8%',
          maxWidth: 520,
        }}>
          <div className="fade-in" style={{ width: "100%" }}>

            <div className="spectrum-bar" style={{ width: 48, marginBottom: 24 }} />

            <h2 style={{ fontSize: 22, fontWeight: 600, color: "#1a1a1a", marginBottom: 6, letterSpacing: "-0.01em" }}>
              Create account
            </h2>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 28, lineHeight: 1.5 }}>
              Join Prismat. It only takes a minute.
            </p>

            <button className="google-btn" onClick={signUpWithGoogle}>
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="divider" style={{ margin: "20px 0" }}>or</div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Username */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#666", marginBottom: 6, letterSpacing: "0.04em" }}>
                  USERNAME
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUserName(e.target.value)}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="yourname"
                  required
                  style={inputBase("username")}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#666", marginBottom: 6, letterSpacing: "0.04em" }}>
                  EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  required
                  style={inputBase("email")}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#666", marginBottom: 6, letterSpacing: "0.04em" }}>
                  PASSWORD
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    required
                    style={{ ...inputBase("password"), paddingRight: 48 }}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} style={eyeButtonStyle} tabIndex={-1}>
                    {showPassword ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#666", marginBottom: 6, letterSpacing: "0.04em" }}>
                  CONFIRM PASSWORD
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    onFocus={() => setFocusedField("confirm")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    required
                    style={{ ...inputBase("confirm"), paddingRight: 48 }}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} style={eyeButtonStyle} tabIndex={-1}>
                    {showConfirm ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{ padding: "10px 14px", background: "#fff0f0", border: "1px solid #fdd", borderRadius: 8, fontSize: 13, color: "#c44" }}>
                  {error}
                </div>
              )}

              <button type="submit" className="login-btn" disabled={isLoading} style={{ marginTop: 4 }}>
                {isLoading ? "Please wait…" : "Create account"}
              </button>

            </form>

            <div style={{ marginTop: 18 }}>
              <span style={{ fontSize: 12, color: "#999" }}>
                Already have an account?{" "}
                <Link to="/login" style={{ color: "#7ec8e3", fontWeight: 500, textDecoration: "none" }}>
                  Sign in
                </Link>
              </span>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}