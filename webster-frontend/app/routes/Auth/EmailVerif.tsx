import { useNavigate } from 'react-router';
import { useState, useRef } from 'react';

const API = import.meta.env.VITE_API;

export default function VerifyEmail() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [resendSent, setResendSent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];

    if (value) {
      newOtp[index] = value[0];
      setOtp(newOtp);
      if (index < 5) inputRefs.current[index + 1]?.focus();
    } else {
      newOtp[index] = '';
      setOtp(newOtp);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    if (!paste) return;
    const newOtp = Array.from({ length: 6 }, (_, i) => paste[i] ?? '');
    setOtp(newOtp);
    const lastIndex = Math.min(paste.length, 6) - 1;
    inputRefs.current[lastIndex]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return;

    try {
      const res = await fetch(`${API}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || data.message || 'Verification failed');
        return;
      }

      setError('');
      navigate(`/projects/${data.userId}`);
    } catch {
      setError('Network error. Please try again.');
    }
  }

  async function handleResend() {
    if (resendTimer > 0) return;

    try {
      const res = await fetch(`${API}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) {
        setError(res.statusText);
        return;
      }

      setResendSent(true);
      setTimeout(() => setResendSent(false), 4000);

      setResendTimer(30);
      const interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setError('Network error. Please try again.');
    }
  }

  const isComplete = otp.every(d => d !== '');

  const inputStyle = (index: number): React.CSSProperties => ({
    width: 48,
    height: 56,
    borderRadius: 10,
    border: `1.5px solid ${otp[index] ? '#b5e4f2' : '#e0e0e0'}`,
    background: otp[index] ? '#f8fdff' : '#f4f4f4',
    fontSize: 22,
    fontWeight: 600,
    textAlign: 'center',
    color: otp[index] ? '#1a5e73' : '#1a1a1a',
    outline: 'none',
    transition: 'all 0.18s ease',
    caretColor: '#7ec8e3',
    fontFamily: "'DM Sans', monospace",
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f7f7f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: "'DM Sans', 'Elms Sans', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '48px 44px 40px',
          border: '1px solid #e8e8e8',
        }}>

          {/* Spectrum bar */}
          <div style={{
            height: 3,
            width: 48,
            background: 'linear-gradient(90deg, #7ec8e3, #b5e4f2)',
            borderRadius: 2,
            marginBottom: 28,
          }} />

          {/* Icon */}
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: '#f0f9fc',
            border: '1px solid #d4eef5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7ec8e3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>

          {/* Heading */}
          <h2 style={{
            fontSize: 22,
            fontWeight: 600,
            color: '#1a1a1a',
            margin: '0 0 6px',
            letterSpacing: '-0.01em',
          }}>
            Email Verification
          </h2>
          <p style={{
            fontSize: 13,
            color: '#888',
            margin: '0 0 24px',
            lineHeight: 1.55,
          }}>
            Enter the 6-digit code sent to your email address.
          </p>

          {/* OTP form */}
          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'flex',
              gap: 10,
              marginBottom: 24,
              justifyContent: 'center',
            }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(e, i)}
                  onKeyDown={e => handleKeyDown(e, i)}
                  onPaste={handlePaste}
                  onFocus={e => {
                    e.target.style.borderColor = '#7ec8e3';
                    e.target.style.background = '#fff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(126,200,227,0.15)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = digit ? '#b5e4f2' : '#e0e0e0';
                    e.target.style.background = digit ? '#f8fdff' : '#f4f4f4';
                    e.target.style.boxShadow = 'none';
                  }}
                  autoFocus={i === 0}
                  style={inputStyle(i)}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={!isComplete}
              style={{
                width: '100%',
                padding: '13px 16px',
                background: isComplete ? '#1a1a1a' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: isComplete ? 'pointer' : 'not-allowed',
                transition: 'background 0.18s ease',
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => {
                if (isComplete) (e.currentTarget as HTMLButtonElement).style.background = '#333';
              }}
              onMouseLeave={e => {
                if (isComplete) (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a';
              }}
            >
              Verify account
            </button>
          </form>

          {/* Resend row */}
          <p style={{
            marginTop: 20,
            fontSize: 12,
            color: '#999',
            textAlign: 'center',
          }}>
            Didn't receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={resendTimer > 0}
              style={{
                background: 'none',
                border: 'none',
                color: resendTimer > 0 ? '#ccc' : '#7ec8e3',
                fontWeight: 500,
                cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                fontSize: 12,
                fontFamily: "'DM Sans', sans-serif",
                padding: 0,
              }}
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend'}
            </button>
          </p>

          {/* Resend confirmation */}
          {resendSent && (
            <div style={{
              marginTop: 12,
              padding: '10px 14px',
              background: '#f0fff4',
              border: '1px solid #b7ebc8',
              borderRadius: 8,
              fontSize: 13,
              color: '#2a7a4a',
            }}>
              Code resent! Check your inbox.
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            background: '#fff0f0',
            border: '1px solid #fdd',
            borderRadius: 8,
            fontSize: 13,
            color: '#c44',
            marginTop: 12,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}