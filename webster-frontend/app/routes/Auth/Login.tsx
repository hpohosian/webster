import { useState } from "react";
import { useNavigate, Link } from 'react-router';
import {GoogleIcon} from '../../assets/Icons'
import "./Login.css";

const GOOGLE_CLIENT_ID = import.meta.env?.VITE_GOOGLE_CLIENT_ID;
const API = import.meta.env?.VITE_API;

function signInWithGoogle() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: import.meta.env?.VITE_REDIRECT_URI ??
      window.location.origin + "/auth/callback",
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetPass, setResetPass] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState("");

  const navigate = (path: string) => { window.location.href = path; };

  // ── submit login 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ emailOrUsername: email, password }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.message || "Login failed.");
      } else {
        navigate(`projects/${data.user.id}`);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── password reset 
  const resetPasswordReq = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Please enter your email"); return; }
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/auth/password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.message || "Reset failed.");
      } else {
        setResetSent(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // input style
  const inputBase = (field: string): React.CSSProperties => ({
    width: "100%",
    padding: "13px 16px",
    fontSize: 14,
    fontWeight: 400,
    color: "#1a1a1a",
    background: focusedField === field ? "#fff" : "#f4f4f4",
    border: focusedField === field
      ? "1.5px solid #7ec8e3"
      : "1.5px solid #e0e0e0",
    borderRadius: 10,
    outline: "none",
    transition: "all 0.18s ease",
    boxSizing: "border-box" as const,
    fontFamily: "'Elms Sans', 'DM Sans', sans-serif",
  });

  return (
    <>
      <div className="wraper-page"> 
        <main className='auth-main'>
          
          {/* Login form area */}
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-start",
            padding: "36px 36px 48px",
            margin: '8%',
            maxWidth: 520,
          }}>
            <div className="fade-in" style={{ width: "100%" }}>

              {/* Spectrum accent */}
              <div className="spectrum-bar" style={{ width: 48, marginBottom: 24 }} />

              <h2 style={{
                fontSize: 22, fontWeight: 600,
                color: "#1a1a1a", marginBottom: 6,
                letterSpacing: "-0.01em",
              }}>
                {resetPass ? "Reset Password" : "Sign in to Prismat"}
              </h2>
              <p style={{ fontSize: 13, color: "#888", marginBottom: 28, lineHeight: 1.5 }}>
                {resetPass
                  ? "Enter your email and we'll send you a reset link."
                  : "Welcome back. Sign in to continue editing."}
              </p>

              {/* Google button */}
              {!resetPass && (
                <>
                  <button className="google-btn" onClick={signInWithGoogle}>
                    <GoogleIcon />
                    Continue with Google
                  </button>

                  <div className="divider" style={{ margin: "20px 0" }}>or</div>
                </>
              )}

              {/* ── Form ── */}
              <form onSubmit={resetPass ? resetPasswordReq : handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Email */}
                <div>
                  <label style={{
                    display: "block", fontSize: 12, fontWeight: 500,
                    color: "#666", marginBottom: 6, letterSpacing: "0.04em",
                  }}>
                    EMAIL
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@example.com"
                    required
                    style={inputBase("email")}
                  />
                </div>

                {/* Password (login mode only) */}
                {!resetPass && (
                  <div>
                    <label style={{
                      display: "block", fontSize: 12, fontWeight: 500,
                      color: "#666", marginBottom: 6, letterSpacing: "0.04em",
                    }}>
                      PASSWORD
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="••••••••"
                        required
                        style={{ ...inputBase("password"), paddingRight: 48 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        style={{
                          position: "absolute", right: 14, top: "50%",
                          transform: "translateY(-50%)",
                          background: "none", border: "none",
                          cursor: "pointer", color: "#aaa", padding: 2,
                          display: "flex", alignItems: "center",
                        }}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div style={{
                    padding: "10px 14px",
                    background: "#fff0f0",
                    border: "1px solid #fdd",
                    borderRadius: 8,
                    fontSize: 13, color: "#c44",
                  }}>
                    {error}
                  </div>
                )}

                {/* Reset sent confirmation */}
                {resetSent && (
                  <div style={{
                    padding: "10px 14px",
                    background: "#f0fff4",
                    border: "1px solid #b7ebc8",
                    borderRadius: 8,
                    fontSize: 13, color: "#2a7a4a",
                  }}>
                    Reset link sent! Check your inbox.
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="login-btn"
                  disabled={isLoading}
                  style={{ marginTop: 4 }}
                >
                  {isLoading
                    ? "Please wait…"
                    : resetPass
                      ? "Send Reset Link"
                      : "Sign In"}
                </button>
              </form>

              {/* Forgot / Back links */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 18,
              }}>
                {!resetPass ? (
                  <>
                    <button
                      onClick={() => { setResetPass(true); setError(""); }}
                      style={{
                        background: "none", border: "none",
                        fontSize: 12, color: "#7ec8e3",
                        cursor: "pointer", fontWeight: 500,
                        letterSpacing: "0.03em",
                        fontFamily: "'Elms Sans', 'DM Sans', sans-serif",
                      }}
                    >
                      Forgot password?
                    </button>
                    <span style={{ fontSize: 12, color: "#999" }}>
                      No account?{" "}
                      <Link to="/register" style={{ color: "#7ec8e3", fontWeight: 500, textDecoration: "none" }}>
                        Sign up
                      </Link>
                    </span>
                  </>
                ) : (
                  <button
                    onClick={() => { setResetPass(false); setResetSent(false); setError(""); }}
                    style={{
                      background: "none", border: "none",
                      fontSize: 12, color: "#7ec8e3",
                      cursor: "pointer", fontWeight: 500,
                      letterSpacing: "0.03em",
                      fontFamily: "'Elms Sans', 'DM Sans', sans-serif",
                    }}
                  >
                   Back to sign in
                  </button>
                )}
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}