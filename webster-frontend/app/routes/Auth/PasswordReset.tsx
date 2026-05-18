import { useState } from "react";
import { Link } from "react-router";
import { AuthHeader } from "../../components/AuthHeader";
import { useParams } from "react-router";
import { IconEye, ClosedIconEye, CheckIcon, IconX } from "../../assets/Icons";

const RINGS = [
  { size: 300, top: -150, right: -150 },
  { size: 200, top: -100, right: -100 },
  { size: 120, top: -60,  right: -60  },
];

const API = import.meta.env.VITE_API;

export default function PasswordReset() {
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [error, setError]             = useState("");
  const [message, setMessage]         = useState("");
  const [loading, setLoading]         = useState(false);
  const { token } = useParams();

  // Password strength
  const rules = {
    length: password.length >= 8,
    upper:  /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const strength      = Object.values(rules).filter(Boolean).length;
  const strengthColor = ["#e5e5e5", "#fbbf24", "#34d399", "#E97F67"][strength];
  const strengthLabel = ["", "Weak", "Good", "Strong"][strength];

  const passwordsMatch = confirm.length > 0 && password === confirm;
  const canSubmit      = rules.length && rules.upper && rules.number && passwordsMatch;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/password-reset/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword: password,
          newPasswordConfirmation: confirm,
        }),
      });
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

  // Confirm input border color
  const confirmBorderColor =
    confirm.length === 0
      ? "border-[var(--border)]"
      : passwordsMatch
      ? "border-[#34d399]"
      : "border-[var(--destructive)]";

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <AuthHeader />

      <main className="flex flex-1">

        {/* ── Left panel ── */}
        <div className="relative hidden lg:flex w-1/2 overflow-hidden">
          {/* base bg */}
          <div className="absolute inset-0 bg-[var(--card)]" />
          {/* gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-transparent" />
          {/* decorative rings */}
          {RINGS.map(({ size, top, right }) => (
            <div
              key={size}
              className="absolute rounded-full border border-[var(--primary)]/20"
              style={{ width: size, height: size, top, right }}
            />
          ))}
        </div>

        {/* Right panel */}
        <div className="flex flex-1 items-center justify-center px-6 py-12 lg:w-1/2">

          {message ? (
            /* Success state */
            <div className="flex flex-col items-center gap-4 text-center max-w-sm">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[var(--card)] border border-[var(--border)]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                  stroke="#E97F67" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)]">All done!</h2>
              <p className="text-[var(--muted-foreground)]">Your password has been reset</p>
              <Link
                to="/login"
                className="mt-2 text-sm font-medium text-[var(--primary)] hover:underline"
              >
                Back to sign in
              </Link>
            </div>

          ) : (
            /* Form state */
            <div className="w-full max-w-sm bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-8 shadow-lg">

              {/* Heading */}
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-[var(--card-foreground)] mb-1">
                  Reset password
                </h1>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Remember it?{" "}
                  <a href="/login" className="text-[var(--primary)] hover:underline">
                    Sign in
                  </a>
                </p>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  Use at least 8 characters with an uppercase letter and a number.
                </p>
              </div>

              {/* Error banner */}
              {error && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-[var(--radius)] bg-[var(--destructive)]/10 border border-[var(--destructive)]/30 text-[var(--destructive)] text-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <form className="flex flex-col gap-5" onSubmit={handleSubmit}>

                {/* New password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--foreground)]">
                    New password <span className="text-[var(--destructive)]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="w-full pr-10 px-3 py-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--input-background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition"
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>

                  {/* Strength meter */}
                  {password.length > 0 && (
                    <div className="mt-1.5">
                      {/* bars */}
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3].map(n => (
                          <div
                            key={n}
                            className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{ background: n <= strength ? strengthColor : "#3a3a3a" }}
                          />
                        ))}
                      </div>
                      {/* rules + label */}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-3">
                          {[
                            { ok: rules.length, text: "8+ chars" },
                            { ok: rules.upper,  text: "Uppercase" },
                            { ok: rules.number, text: "Number" },
                          ].map(({ ok, text }) => (
                            <span
                              key={text}
                              className={`flex items-center gap-1 text-xs transition-colors ${
                                ok ? "text-[#34d399]" : "text-[var(--muted-foreground)]"
                              }`}
                            >
                              {ok ? <CheckIcon /> : <IconX />}
                              {text}
                            </span>
                          ))}
                        </div>
                        {strengthLabel && (
                          <span
                            className="text-xs font-medium transition-colors"
                            style={{ color: strengthColor }}
                          >
                            {strengthLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--foreground)]">
                    Confirm password <span className="text-[var(--destructive)]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat your new password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      required
                      className={`w-full pr-10 px-3 py-2 rounded-[var(--radius)] border bg-[var(--input-background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition ${confirmBorderColor}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(p => !p)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition"
                    >
                      <EyeIcon open={showConfirm} />
                    </button>
                  </div>
                  {confirm.length > 0 && !passwordsMatch && (
                    <span className="text-xs text-[var(--destructive)]">
                      Passwords don't match
                    </span>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-[var(--radius)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-semibold transition hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        className="animate-spin"
                      >
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                      Saving…
                    </>
                  ) : (
                    "Set new password"
                  )}
                </button>

              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ── Eye icon helper ── */
function EyeIcon({ open }: { open: boolean }) {
  return open ? <ClosedIconEye /> : <IconEye />;
}