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
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setShowInstallBanner(false);
    setDeferredPrompt(null);
  };

    const handleBiometricVerify = async () => {
    const biometricEnabled = localStorage.getItem('biometricEnabled') === 'true';
    const savedCredentialStr = localStorage.getItem('webauthnCredential');

    if (!biometricEnabled || !savedCredentialStr) return;

    try {
      const credentialData = JSON.parse(savedCredentialStr);
      let rawIdArray = null;

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
        mediation: "required",
      };

      if (rawIdArray) {
        publicKeyRequest.allowCredentials = [{
          type: 'public-key',
          id: rawIdArray,
          transports: ['internal']
        }];
      }

      await navigator.credentials.get({ publicKey: publicKeyRequest });
      
      console.log('✅ Biometric verification successful');
      localStorage.setItem('biometricLastVerified', Date.now().toString());
    } catch (err) {
      console.error('Biometric auto-verify error:', err.name, err.message);

      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        console.log('User cancelled biometric prompt → forcing app reload (cannot bypass)');
        window.location.reload(true);
      }
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
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleBiometricVerify();
    }, 600);

    return () => clearTimeout(timer);
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

        {isOffline && (
          <div className="fixed top-0 left-0 right-0 z-[998] bg-warning/90 text-text-inverse px-4 py-2 text-center text-sm font-medium">
            ⚠️ Offline • App works with cached data
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
      </Router>
    </AuthProvider>
  );
}

export default App;