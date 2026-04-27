import { useNavigate } from 'react-router';
import { useState } from 'react';
import AuthHeader from '../AuthHeader';
// import Footer from '../Footer';
// import './EmailVerif.css';

const API = import.meta.env.VITE_API;

export default function VerifyEmail() {
  const [otp, setOtp]     = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  // OTP input handlers
  function handleChange(event: React.ChangeEvent<HTMLInputElement>, index: number) {
    const value = event.target.value.replace(/[^0-9]/g, "");
    const newOtp = [...otp];

    if (value) {
      newOtp[index] = value[0];
      setOtp(newOtp);
      const next = event.target.nextSibling as HTMLInputElement | null;
      if (next) next.focus();
    } else {
      newOtp[index] = "";
      setOtp(newOtp);
      const prev = event.target.previousSibling as HTMLInputElement | null;
      if (prev) prev.focus();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>, index: number) {
    // Allow backspace to move backwards even when field is already empty
    if (event.key === 'Backspace' && !otp[index]) {
      const prev = event.currentTarget.previousSibling as HTMLInputElement | null;
      if (prev) prev.focus();
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const paste = event.clipboardData.getData('text').replace(/[^0-9]/g, '');
    if (!paste) return;

    const newOtp = Array.from({ length: 6 }, (_, i) => paste[i] ?? "");
    setOtp(newOtp);

    const lastIndex = Math.min(paste.length, 6) - 1;
    const inputs = (event.currentTarget.closest('form') as HTMLFormElement)
      .querySelectorAll<HTMLInputElement>('input');
    if (inputs[lastIndex]) inputs[lastIndex].focus();
  }

  // Submit
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const code = otp.join("");
    if (code.length < 6) return;
    try{

      const res = await fetch(`${API}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code }),
      })
        const data = await res.json();

        console.log(data);
        
  
      // сервер вернул ошибку
      if (!res.ok || data.error) {
        setError(data.error || "Verification failed");
        return;
      }
      setError("");
      navigate("/");
    }catch{
      setError('Network error. Please try again.');
    }
  }

  //  Resend code 
  async function handleResend() {
    if (resendTimer > 1) return;
    try {
      const res = await fetch(`${API}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      })
      if (!res.ok){
        setError(res.statusText);
      }
    } catch{
      setError("Network error. Please try again.");
    }
  }

  const isComplete = otp.every(d => d !== "");

  return (
    <>
      <AuthHeader />

      <div className="centerContainer page">
        <div className="card">

          {/* Icon */}
          <div className="iconWrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e97f67" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>

          {/* Heading */}
          <h1 className="title">Email Verification</h1>
          <p className="subtitle">
            Enter the 6-digit code sent to your email address.
          </p>

          {/* OTP form */}
          <form onSubmit={handleSubmit}>
            <div className="otpRow">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(e, i)}
                  onKeyDown={e => handleKeyDown(e, i)}
                  onPaste={handlePaste}
                  className={`otpInput${digit ? ' filled' : ''}`}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <button
              type="submit"
              className="submitBtn"
              disabled={!isComplete}
            >
              Verify account →
            </button>
          </form>

          {/* Resend */}
          <p className="resendRow">
            Didn't receive the code?{' '}
            <button
              className="resendLink"
              onClick={handleResend}
              disabled={resendTimer > 0}
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend'}
            </button>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="errorMsg">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}
      </div>

      {/* <Footer /> */}
    </>
  );
}
