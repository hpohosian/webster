import { useState } from "react";
import { Link, useNavigate } from 'react-router';
import { AuthHeader } from '../../components/AuthHeader'
import "./Register.css";
import "./Login.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API = import.meta.env.VITE_API;

function signUpWithGoogle() {
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

export default function RegisterPage() {
  const [username, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate(); 
  const [error, setError] = useState("");
  const [notifMessage, setMessage] = useState("");

const handleSubmit = async (e: React.SubmitEvent) => {
  e.preventDefault();

  if (password !== confirm) {
    setError("Passwords do not match");
    console.error("Passwords do not match");
    return;
  }

  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      username,
      email,
      password,
      passwordConfirmation: confirm,
      firstName,
      lastName,
    })
  });

  const data = await res.json();
   if (data.error) {
        console.log(data.error); // ошибка от сервера
        setError(data.message);
        console.log(data.message);
      } else {
        setMessage(`Password reset email sent to ${email}`);
        navigate('/verify-email');
      }       
};
  return (

  <div className="register-page">
    <AuthHeader/>

    <main className="main">
      <div className="left-panel">
        <div className="left-bg"></div>
        <div className="left-overlay"></div>
       
        <div className="right-panel">
          <div className="register-card">
            <div className="heading">

            <h1>Create account</h1>

            <p>
              Already have one?
              <Link to="/login"> Sign in</Link>
            </p>

        </div>

        <button
          className="google-btn" onClick={signUpWithGoogle}>
          Continue with Google
        </button>

        <div className="divider">
        <div className="divider-line"></div>

        <span>
          or register with email
        </span>

        <div className="divider-line"></div>

        </div>
          <form onSubmit={handleSubmit} className="form">

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e=>setUserName(e.target.value)}
              required
            /> 
            <div className="name-row">
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={e=>setFirstName(e.target.value)}
                required
              />

              <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={e=>setLastName(e.target.value)}
              required
              />

          </div>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={e=>setConfirm(e.target.value)}
              required
            />

            <button
              type="submit"
              className="submit-btn">
              Create account
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