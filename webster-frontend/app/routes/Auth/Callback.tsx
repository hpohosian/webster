import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      navigate("/login");
      return;
    }

    // Send the code to your backend
    fetch(`${import.meta.env.VITE_API}/auth/google-callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          navigate("/login?error=google_failed");
        } else {
          navigate("/"); // home after login
        }
      })
      .catch(() => navigate("/login?error=google_failed"));
  }, []);

  return <p>Signing you in...</p>;
}