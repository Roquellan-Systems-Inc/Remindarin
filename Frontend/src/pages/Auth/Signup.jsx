import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';

const API_BASE = "https://accounts.remindarin.orbmiv.com";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: `Code sent to ${email}. Check your email.` });
        // Navigate to verify page after a short delay
        setTimeout(() => navigate('/login'), 1800);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send code' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
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
            <Mail size={32} className="text-text-inverse" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tighter">Create account</h1>
          <p className="text-text-secondary mt-2">We'll send you a verification code</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
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
            className="w-full h-14 bg-primary text-text-inverse font-semibold rounded-3xl active:scale-[0.985] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending code...
              </>
            ) : (
              'Send verification code'
            )}
          </button>
        </form>

        {message && (
          <div className={`mt-6 px-5 py-4 rounded-3xl text-center text-sm font-medium ${
            message.type === 'success' 
              ? 'bg-accent-positive/10 text-accent-positive' 
              : 'bg-red-500/10 text-red-500'
          }`}>
            {message.text}
          </div>
        )}

        <div className="text-center mt-8 text-sm text-text-secondary">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-primary font-medium hover:underline">
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}