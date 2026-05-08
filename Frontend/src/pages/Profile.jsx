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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const handleBiometricEnroll = async () => {
    if (!user) return;
    setIsEnrolling(true);

    try {
      const options = {
        challenge: new Uint8Array(32),
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
      };

      const credential = await startRegistration(options);

      console.log('✅ Biometric credential created:', credential);
      
      setBiometricEnabled(true);
      localStorage.setItem('biometricEnabled', 'true');
      
      alert('🎉 Biometric login enabled! Face ID / Fingerprint is now active.');
    } catch (err) {
      console.error('Biometric enrollment failed:', err);
      if (err.name !== 'NotAllowedError') {
        alert('❌ Biometric enrollment failed. Your device may not support it or permission was denied.');
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
          
          <div className="mt-10 border border-border rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Fingerprint className="text-accent-positive" size={28} />
              <div>
                <div className="font-semibold text-lg">Biometric Login</div>
                <div className="text-text-secondary text-sm">Face ID • Fingerprint • Windows Hello</div>
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
                  <>Enrolling...</>
                ) : (
                  <>
                    <Fingerprint size={22} />
                    Enable Face ID / Fingerprint
                  </>
                )}
              </button>
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