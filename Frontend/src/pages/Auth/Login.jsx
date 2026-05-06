import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, LogIn } from 'lucide-react';

const API_BASE = "https://accounts.remindarin.orbmiv.com";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email'); // email or code
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      if (res.ok) {
        setStep('code');
        setMessage({ type: 'success', text: `Code sent to ${email}` });
      } else {
        setMessage({ type: 'error', text: 'Failed to send code' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('remindarin_user', JSON.stringify({ 
          id: data.user?.id, 
          email: data.user?.email 
        }));
        setMessage({ type: 'success', text: 'Login successful!' });
        setTimeout(() => navigate('/dashboard'), 800);
      } else {
        setMessage({ type: 'error', text: data.error || 'Invalid code' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setIsLoading(false);
    }
  };

    const handleGoogleLogin = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/google`);
      const data = await res.json();
      if (data.auth_url) {
        window.location.href = data.auth_url;
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 bg-foundation/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary">
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full px-6 pt-24">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
            <LogIn size={32} className="text-text-inverse" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tighter">
            {step === 'email' ? 'Welcome back' : 'Enter code'}
          </h1>
          <p className="text-text-secondary mt-2">
            {step === 'email' 
              ? 'Sign in with your email' 
              : `We sent a code to ${email}`}
          </p>
        </div>

        {step === 'email' ? (
          <>
            <form onSubmit={handleSendCode}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-secondary mb-2">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full bg-background border border-border rounded-3xl px-6 py-5 text-lg focus:outline-none focus:border-primary"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full h-14 bg-primary text-text-inverse font-semibold rounded-3xl active:scale-[0.985] transition-all disabled:opacity-50"
              >
                {isLoading ? 'Sending code...' : 'Continue with email'}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-xs text-text-secondary font-medium">OR</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full h-14 border border-border rounded-3xl flex items-center justify-center gap-3 hover:bg-background transition-colors"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span className="font-medium">Continue with Google</span>
            </button>
          </>
        ) : (
          <form onSubmit={handleVerify}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-secondary mb-2">Verification code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full bg-background border border-border rounded-3xl px-6 py-5 text-3xl text-center tracking-[8px] font-mono focus:outline-none focus:border-primary"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full h-14 bg-primary text-text-inverse font-semibold rounded-3xl active:scale-[0.985] transition-all disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify & log in'}
            </button>
          </form>
        )}

        {message && (
          <div className={`mt-6 px-5 py-4 rounded-3xl text-center text-sm font-medium ${
            message.type === 'success' 
              ? 'bg-accent-positive/10 text-accent-positive' 
              : 'bg-red-500/10 text-red-500'
          }`}>
            {message.text}
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/signup')}
            className="text-primary font-medium hover:underline"
          >
            Don't have an account? Sign up
          </button>
        </div>
      </div>
    </div>
  );
}