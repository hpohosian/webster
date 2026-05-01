import { useState } from "react";
import { Link } from 'react-router'
import { AuthHeader} from '../../components/AuthHeader'
import styles from "./PasswordReset.module.css";
import { useParams } from "react-router";

import {
  IconEye,
  ClosedIconEye,
  CheckIcon,
  CrossIcon,
} from '../../assets/Icons.tsx'

const RINGS = [
  { size: 300, top: -150, right: -150 },
  { size: 200, top: -100, right: -100 },
  { size: 120, top:  -60, right:  -60 },
];

const API = import.meta.env.VITE_API;

export default function PasswordReset() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useParams();

  //  Password strength
  const rules = {
    length: password.length >= 8,
    upper:  /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const strength      = Object.values(rules).filter(Boolean).length;
  const strengthColor = ["#eee", "#fbbf24", "#34d399", "#E97F67"][strength];
  const strengthLabel = ["", "Weak", "Good", "Strong"][strength];

  const passwordsMatch = confirm.length > 0 && password === confirm;
  const canSubmit      = rules.length && rules.upper && rules.number && passwordsMatch;

  // Submit
  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setError("");
    setMessage("");
    setLoading(true);

    try {
      console.log(token);
      
      const res = await fetch(
        `${API}/auth/password-reset/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newPassword: password,
            newPasswordConfirmation: confirm,
          }),
        }
      );

      const data = await res.json();
      if (data.error) setError(data.message);
      else setMessage("Password has been reset successfully!");
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  //  Confirm border class
  const confirmClass = [
    styles.input,
    confirm.length > 0 ? (passwordsMatch ? styles.inputMatch : styles.inputMismatch) : "",
  ].join(" ");

  return (
    <div className={styles.page}>
      <AuthHeader/>
      
      <main className={styles.main}>

        {/* Back ground */}
        <div className={styles.leftPanel}>
          <div className={styles.leftBg} />
          <div className={styles.leftGradient} />

          {RINGS.map(({ size, top, right }) => (
            <div
              key={size}
              className={styles.ring}
              style={{ width: size, height: size, top, right }}
            />
          ))}
         </div>
         
        {/* --- Right panel */}
        <div className={styles.rightPanel}>

          {message ? (
            /* Success state */
            <div className={styles.successWrap}>
              <div className={styles.successIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E97F67" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className={styles.successTitle}>All done!</h2>
              <p className={styles.successText}>
                Your password has been reset
              </p>
              <Link to="/login" className={styles.successLink}>Back to sign in</Link>
            </div>

          ) : (
            /* -- Form state */
            <div className={styles.card}>

              <div className={styles.cardHeading}>
                <h1 className={styles.cardTitle}>Reset password</h1>
                <p className={styles.cardSubtitle}>
                  Remember it?{" "}
                  <a href="/login">Sign in</a>
                </p>
                 <p className={styles.leftSubtext}>
                  Use at least 8 characters with an uppercase letter and a number.
                </p>
              </div>

              {error && (
                <div className={styles.errorBanner}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <form className={styles.form} onSubmit={handleSubmit}>

                {/* New password */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    New password <span>*</span>
                  </label>
                  <div className={styles.inputWrap}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className={styles.input}
                    />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(p => !p)}>
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>

                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div className={styles.strengthWrap}>
                      <div className={styles.strengthBars}>
                        {[1, 2, 3].map(n => (
                          <div
                            key={n}
                            className={styles.strengthBar}
                            style={{ background: n <= strength ? strengthColor : "#e5e5e5" }}
                          />
                        ))}
                      </div>
                      <div className={styles.strengthMeta}>
                        <div className={styles.strengthRules}>
                          {[
                            { ok: rules.length, text: "8+ chars" },
                            { ok: rules.upper,  text: "Uppercase" },
                            { ok: rules.number, text: "Number" },
                          ].map(({ ok, text }) => (
                            <span key={text} className={`${styles.strengthRule} ${ok ? styles.met : ""}`}>
                              {ok ? <CheckIcon /> : <CrossIcon />}
                              {text}
                            </span>
                          ))}
                        </div>
                        {strengthLabel && (
                          <span className={styles.strengthLabel} style={{ color: strengthColor }}>
                            {strengthLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    Confirm password <span>*</span>
                  </label>
                  <div className={styles.inputWrap}>
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat your new password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      required
                      className={confirmClass}
                    />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(p => !p)}>
                      <EyeIcon open={showConfirm} />
                    </button>
                  </div>
                  {confirm.length > 0 && !passwordsMatch && (
                    <span className={styles.mismatchText}>Passwords don't match</span>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className={styles.submitBtn}
                >
                  {loading ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.spinner}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                      Saving…
                    </>
                  ) : "Set new password"}
                </button>

              </form>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}

/* ── Small icons ── */

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <ClosedIconEye/>
  ) : (
    <IconEye/>
  );
}
