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

    if (!window.isSecureContext) {
      setError('Biometric authentication requires HTTPS or localhost.');
      setIsEnrolling(false);
      return;
    }

    if (!window.PublicKeyCredential || !navigator.credentials?.create) {
      setError('WebAuthn not supported by your browser.');
      setIsEnrolling(false);
      return;
    }

    try {
      const isPlatformAuthAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.();
      if (!isPlatformAuthAvailable) {
        setError('No fingerprint or face ID set up on your device. Go to Settings → Security → Fingerprint or Face ID and set it up first.');
        setIsEnrolling(false);
        return;
      }
    } catch (e) {}

    try {
      const challenge = window.crypto.getRandomValues(new Uint8Array(32));

      const userId = new TextEncoder().encode(user.id || user.email || 'user-' + Date.now());

      const publicKeyOptions = {
        challenge,
        rp: {
          name: "Remindarin",
          id: window.location.hostname,
        },
        user: {
          id: userId,
          name: user.email,
          displayName: user.email ? user.email.split('@')[0] : "User",
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },
          { alg: -257, type: "public-key" }
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "required",
          requireResidentKey: true,
        },
        timeout: 120000,
        attestation: "none",
        excludeCredentials: [],
      };

      const credential = await navigator.credentials.create({ publicKey: publicKeyOptions });

      console.log('✅ Biometric credential created successfully:', credential);
      
            setBiometricEnabled(true);
      localStorage.setItem('biometricEnabled', 'true');
      localStorage.setItem('webauthnCredential', JSON.stringify(credential));
    } catch (err) {
      console.error('Biometric error:', err.name, err.message);

      let errorMsg = 'Biometric enrollment failed.';
      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        errorMsg = 'You cancelled the prompt. Tap again and allow the system fingerprint or face ID prompt when it appears.';
      } else if (err.name === 'NotSupportedError') {
        errorMsg = 'Your Tecno Camon 40 Pro 5G does not support platform biometrics in this browser. Use Chrome or Edge.';
      } else if (err.name === 'SecurityError') {
        errorMsg = 'Secure context required. Deploy to Vercel (HTTPS) or use localhost.';
      } else if (err.name === 'InvalidStateError') {
        errorMsg = 'Credential conflict. Clear site data and try again.';
      } else {
        errorMsg = 'Please allow the system fingerprint or face ID prompt when it appears. Make sure it is set up in phone settings.';
      }
      setError(errorMsg);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleBiometricVerify = async () => {
    if (!window.isSecureContext) return false;
    if (!window.PublicKeyCredential || !navigator.credentials?.get) return false;

    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: window.crypto.getRandomValues(new Uint8Array(32)),
          rpId: window.location.hostname,
          userVerification: "required",
          timeout: 120000,
        }
      });
      localStorage.setItem('biometricLastVerified', Date.now().toString());
      return true;
    } catch (err) {
      console.error('Biometric verify error:', err.name, err.message);
      return false;
    }
  };

  const handleBiometricBypass = () => {
    setBiometricEnabled(true);
    localStorage.setItem('biometricEnabled', 'true');
    setError(null);
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
          
          <div className="mt-10 border border-border rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Fingerprint className="text-accent-positive" size={28} />
              <div>
                <div className="font-semibold text-lg">Biometric Login</div>
                <div className="text-text-secondary text-sm">Face ID • Fingerprint • Touch ID</div>
              </div>
            </div>

                        {biometricEnabled ? (
              <div className="flex items-center justify-center gap-2 bg-accent-positive/10 text-accent-positive rounded-3xl py-4 px-6 mb-6">
                <ShieldCheck size={20} />
                <span className="font-medium">Biometric login is enabled</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleBiometricEnroll}
                    disabled={isEnrolling}
                    className="h-14 bg-background border border-border rounded-3xl font-medium flex flex-col items-center justify-center gap-1 hover:border-accent-positive transition-colors"
                  >
                    {isEnrolling ? (
                      <span className="text-sm">Preparing system prompt...</span>
                    ) : (
                      <>
                        <Fingerprint size={22} />
                        <span className="text-sm">Fingerprint</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBiometricEnroll}
                    disabled={isEnrolling}
                    className="h-14 bg-background border border-border rounded-3xl font-medium flex flex-col items-center justify-center gap-1 hover:border-accent-positive transition-colors"
                  >
                    {isEnrolling ? (
                      <span className="text-sm">Preparing system prompt...</span>
                    ) : (
                      <>
                        <span className="text-2xl">👤</span>
                        <span className="text-sm">Face ID</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={handleBiometricBypass}
                  className="mt-6 w-full h-12 bg-background border border-border text-text-secondary rounded-3xl font-medium text-sm flex items-center justify-center gap-2 hover:border-accent-positive transition-colors"
                >
                  <span>Bypass for testing</span>
                </button>
              </>
            )}

            {error && (
              <p className="mt-4 text-red-500 text-sm text-center">{error}</p>
            )}

            <p className="text-xs text-text-secondary text-center mt-6">
              Your Tecno Camon 40 Pro 5G will show the native system prompt
            </p>
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