import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AIChat from './pages/AIChat';
import QuickCapture from './pages/QuickCapture';
import Reminders from './pages/Reminders';
import Insights from './pages/Insights';
import Profile from './pages/Profile';
import Signup from './pages/Auth/Signup';
import Login from './pages/Auth/Login';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showBiometricSheet, setShowBiometricSheet] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setShowInstallBanner(false);
    setDeferredPrompt(null);
  };

    const handleBiometricVerify = async () => {
    setIsVerifying(true);
    try {
      const savedCredentialStr = localStorage.getItem('webauthnCredential');
      if (!savedCredentialStr) {
        console.warn('No stored biometric credential found');
        return false;
      }

      const credentialData = JSON.parse(savedCredentialStr);
      // Reconstruct rawId (WebAuthn stores it as ArrayBuffer → becomes object after JSON)
      let rawIdArray;
      if (credentialData.rawId) {
        if (credentialData.rawId instanceof Uint8Array || Array.isArray(credentialData.rawId)) {
          rawIdArray = new Uint8Array(credentialData.rawId);
        } else if (typeof credentialData.rawId === 'object') {
          rawIdArray = new Uint8Array(Object.values(credentialData.rawId));
        }
      }

      const publicKeyRequest = {
        challenge: window.crypto.getRandomValues(new Uint8Array(32)),
        rpId: window.location.hostname,
        userVerification: "required",
        timeout: 120000,
      };

      if (rawIdArray) {
        publicKeyRequest.allowCredentials = [{
          type: 'public-key',
          id: rawIdArray,
          transports: ['internal']
        }];
      }

      const credential = await navigator.credentials.get({ publicKey: publicKeyRequest });

      localStorage.setItem('biometricLastVerified', Date.now().toString());
      setShowBiometricSheet(false);
      return true;
    } catch (err) {
      console.error('Biometric verify error:', err.name, err.message);

      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        return false;
      }

      if (err.name === 'NotFoundError' || err.name === 'InvalidStateError' || err.name === 'NotSupportedError') {
        setShowBiometricSheet(false);
        console.warn('No passkey available – biometric requirement skipped this time');
      }

      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const biometricEnabled = localStorage.getItem('biometricEnabled') === 'true';
    const hasStoredCredential = !!localStorage.getItem('webauthnCredential');
    const lastVerified = localStorage.getItem('biometricLastVerified');

    if (biometricEnabled && hasStoredCredential && (!lastVerified || Date.now() - parseInt(lastVerified) > 1000 * 60 * 60 * 24)) {
      setShowBiometricSheet(true);
    }
  }, []);

  useEffect(() => {
    const biometricEnabled = localStorage.getItem('biometricEnabled') === 'true';
    const lastVerified = localStorage.getItem('biometricLastVerified');
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    if (biometricEnabled && (!lastVerified || Date.now() - parseInt(lastVerified) > 1000 * 60 * 60 * 24)) {
      setShowBiometricSheet(true);
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        {showInstallBanner && deferredPrompt && (
          <div className="fixed top-0 left-0 right-0 z-[999] bg-white dark:bg-foundation border-b border-border px-4 py-3 flex items-center gap-3 shadow-sm">
            <button 
              onClick={() => setShowInstallBanner(false)}
              className="text-text-secondary hover:text-text-primary p-1"
            >
              ✕
            </button>
            
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-text-inverse font-bold text-2xl">R</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-base">Download the app</div>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-accent-positive font-medium">4.9</span>
                <span className="text-yellow-400">★★★★★</span>
                <span className="text-text-secondary text-xs">• 2M+</span>
              </div>
            </div>
            
            <button 
              onClick={handleInstallClick}
              className="bg-primary text-text-inverse px-8 py-2 rounded-2xl font-semibold text-sm active:scale-95 transition-all"
            >
              Get
            </button>
          </div>
        )}

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ai" 
            element={
              <ProtectedRoute>
                <AIChat />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/capture" 
            element={
              <ProtectedRoute>
                <QuickCapture />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reminders" 
            element={
              <ProtectedRoute>
                <Reminders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/insights" 
            element={
              <ProtectedRoute>
                <Insights />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
        </Routes>

        {showBiometricSheet && (
          <div className="fixed inset-0 bg-black/60 z-[10000] flex items-end">
            <div 
              className="bg-foundation w-full max-w-3xl mx-auto rounded-t-3xl px-6 pt-6 pb-12 max-h-[85vh] overflow-hidden"
              style={{ touchAction: 'none' }}
            >
              <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-8"></div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-4xl mb-6">🔐</div>
                <div className="font-semibold text-2xl tracking-tighter mb-2">Verify with Biometrics</div>
                <div className="text-text-secondary mb-8">Your Tecno Camon 40 Pro 5G will show the native fingerprint or face ID prompt</div>
                
                <button
                  onClick={async () => {
                    const success = await handleBiometricVerify();
                    if (!success) {
                      alert('Biometric verification failed. Please try again.');
                    }
                  }}
                  disabled={isVerifying}
                  className="w-full h-14 bg-primary text-text-inverse rounded-3xl font-semibold flex items-center justify-center gap-3 hover:bg-primary/90 transition-colors"
                >
                  {isVerifying ? 'Verifying...' : 'Use Fingerprint / Face ID'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Router>
    </AuthProvider>
  );
}

export default App;