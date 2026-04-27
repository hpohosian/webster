import { useState } from "react";
import { useNavigate, Link } from 'react-router';
import { AuthHeader } from '../AuthHeader'

import "./Login.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API = import.meta.env.VITE_API;
function signInWithGoogle() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_REDIRECT_URI ?? window.location.origin + "/auth/callback",
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
  });

  window.location.href =
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ resetPass, setResetPass ] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate(); 
  
  //submit
  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      emailOrUsername: email,
      password,
    })
  });
    const data = await res.json();
    console.log("login",data);
   if (data.error) {
        setError(data.message)
        console.log(data.error); // ошибка от сервера
      } else {
        console.log('');
        // all good
        navigate('/');
      }       
  };
  //passreset
  const resetPasswordReq = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (email === '') {
      setError("Please enter the email")
    } 
    const res = await fetch(`${API}/auth/password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      email,
      password,
    })
  });
    const data = await res.json();
    console.log(data);
    if (data.error) {
        console.log(data.error); // ошибка от сервера
    } else {
        console.log('');
        setResetPass(true)
    }     
  };

  const inputStyle = (field: string) => ({
    width: "100%",
    padding: "14px 16px",
    fontSize: 15,
    fontWeight: 500,
    color: "#000",
    background: focusedField === field ? "#fff" : "#F5F5F5",
    border:
      focusedField === field
        ? "1.5px solid #E97F67"
        : "1.5px solid transparent",
    borderRadius: 12,
    outline: "none",
    transition: "all 0.18s ease",
    boxSizing: "border-box",
  });

  return (
    <div className="login-page">

      <AuthHeader/>
      <main className="main">

        {/* Background SIDE */}
         <div className="left-panel">
          <div className="left-bg" />
           <div className="left-overlay" />
            
            <div className="right-panel">
              <div className="login-card">
                <div className="heading">
                  <h1>Sign in</h1>

                  <p>
                    Don't have an account?{" "}
                    <Link to="/register">Create one</Link>
                  </p>
                </div>

                <button
                  className="google-btn"
                  onClick={signInWithGoogle}
                >
                  Continue with Google
                </button>

                <div className="divider">
                  <div className="divider-line" />
                  <span>or sign in with email</span>
                  <div className="divider-line" />
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="form"
                >
                  <label>Email address</label>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle("email")}
                    required
                  />

                  <label>Password</label>

                  <div className="password-field">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      style={inputStyle("password")}
                      required
                    />

                    <button
                      type="button" 
                      className="show-password"
                      onClick={() => setShowPassword((p) => !p)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div>
                    <button className="pass-req" onClick={resetPasswordReq}>
                    forgot your password?
                    </button>
                    { resetPass? (
                      <p className="reset-text"> Reset link is sent. Check your email </p>
                      ):(
                        <></>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="submit-btn"
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </button>

                     {/* Error banner */}
                  {error && (
                    <div style={{ padding: "16px 24px", background: "#fff0ed", borderRadius: 14, color: "#c0392b", fontWeight: 600, fontSize: 14 }}>
                      {error}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
      </main>

    </div>
  );
}