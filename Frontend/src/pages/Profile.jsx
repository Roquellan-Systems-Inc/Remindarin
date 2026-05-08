import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { startRegistration } from '@simplewebauthn/browser';
import { Fingerprint, ShieldCheck } from 'lucide-react';
import BottomNav from '../components/layout/BottomNav';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

        const handleBiometricEnroll = async () => {
    if (!user) return;
    setIsEnrolling(true);
    setError(null);

    // 1. Secure context check (required for WebAuthn)
    if (!window.isSecureContext) {
      setError('Secure context required');
      setIsEnrolling(false);
      alert('❌ Biometric authentication requires HTTPS.\n\nOn your Tecno Camon 40 Pro 5G:\n1. Deploy to Vercel (HTTPS)\n2. Or test on http://localhost:5173\n\nNon-secure URLs are blocked by Android/Chrome for security.');
      return;
    }

    // 2. WebAuthn support check
    if (!window.PublicKeyCredential || !navigator.credentials) {
      setError('WebAuthn not supported');
      setIsEnrolling(false);
      alert('❌ Your browser does not support biometric login.\n\nOn Tecno Camon 40 Pro 5G use Chrome or Edge.');
      return;
    }

    try {
      // Real production WebAuthn enrollment
      const challenge = window.crypto.getRandomValues(new Uint8Array(32));

      const options = {
        challenge,
        rp: {
          name: "Remindarin",
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(user.id || user.email),
          name: user.email,
          displayName: user.email.split('@')[0],
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },
          { alg: -257, type: "public-key" }
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "preferred",
        },
        timeout: 60000,
        attestation: "none",
      };

      const credential = await startRegistration(options);

      console.log('✅ Biometric credential created successfully:', credential);
      
      setBiometricEnabled(true);
      localStorage.setItem('biometricEnabled', 'true');
      localStorage.setItem('webauthnCredential', JSON.stringify(credential));
      
      alert('🎉 Success! Face ID / Fingerprint is now enabled on your Tecno Camon 40 Pro 5G.');
    } catch (err) {
      console.error('Biometric error:', err.name, err.message);
      setError(err.message || 'Unknown error');

      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        alert('❌ You cancelled the fingerprint prompt.');
      } else if (err.name === 'NotSupportedError') {
        alert('❌ Your Tecno Camon 40 Pro 5G does not support platform biometrics in this browser.\nTry Chrome or Edge.');
      } else {
        alert('❌ Biometric enrollment failed.\n\nMake sure:\n• Fingerprint is set up in your phone settings\n• You are on HTTPS (Vercel) or localhost\n• You allow the system fingerprint prompt');
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-20">
      <div className="pt-8 px-6 max-w-3xl mx-auto">
        <div className="text-3xl font-semibold tracking-tighter mb-8">Profile</div>
        
        <div className="bg-foundation rounded-3xl p-8 text-center">
          <div className="w-24 h-24 mx-auto bg-primary rounded-3xl flex items-center justify-center text-5xl text-text-inverse mb-6">
            👤
          </div>
          <div className="font-semibold text-2xl">{user?.email || 'User'}</div>
          <div className="text-accent-positive text-sm mt-1">✓ Verified</div>
          
          {/* Biometric Section - Real Production Flow */}
          <div className="mt-10 border border-border rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Fingerprint className="text-accent-positive" size={28} />
              <div>
                <div className="font-semibold text-lg">Biometric Login</div>
                <div className="text-text-secondary text-sm">Face ID • Fingerprint • Touch ID • Windows Hello</div>
              </div>
            </div>
            
            {biometricEnabled ? (
              <div className="flex items-center justify-center gap-2 bg-accent-positive/10 text-accent-positive rounded-3xl py-4 px-6">
                <ShieldCheck size={20} />
                <span className="font-medium">Biometric login is enabled</span>
              </div>
            ) : (
              <button
                onClick={handleBiometricEnroll}
                disabled={isEnrolling}
                className="w-full h-14 bg-primary text-text-inverse rounded-3xl font-semibold flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-70"
              >
                {isEnrolling ? (
                  <>Enrolling with device...</>
                ) : (
                  <>
                    <Fingerprint size={22} />
                    Enable Face ID / Fingerprint
                  </>
                )}
              </button>
            )}
            
            {error && (
              <p className="mt-4 text-red-500 text-sm">{error}</p>
            )}
          </div>

          <div className="mt-12 space-y-6">
            <button className="w-full h-14 bg-background border border-border rounded-3xl font-medium flex items-center justify-center gap-3 hover:bg-white/5 transition-colors">
              <span>🔑</span>
              <span>Account Settings</span>
            </button>
            <button className="w-full h-14 bg-background border border-border rounded-3xl font-medium flex items-center justify-center gap-3 hover:bg-white/5 transition-colors">
              <span>📧</span>
              <span>Notification Preferences</span>
            </button>
            <button 
              onClick={handleLogout}
              className="w-full h-14 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-3xl font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
}