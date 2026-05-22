import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

const API = import.meta.env.VITE_API;

export default function VerifyEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setError('Token missing');
      return;
    }

    fetch(`${API}/auth/verify-email?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.userId) {
          setStatus('success');
          setTimeout(() => navigate(`/projects/${data.userId}`), 2000);
        } else {
          setStatus('error');
          setError(data.message || 'Verification failed');
        }
      })
      .catch(() => {
        setStatus('error');
        setError('Network error');
      });
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {status === 'loading' && <p>Verifying...</p>}
      {status === 'success' && <p>Email confirmed! Redirecting...</p>}
      {status === 'error' && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
