import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useState, useEffect, useRef } from 'react';
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
const [isOffline, setIsOffline] = useState(!navigator.onLine);

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
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => console.log('Service Worker registered for push'))
        .catch((err) => console.error('SW registration failed', err));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleBiometricVerify();
    }, 600);

    return () => clearTimeout(timer);
  }, []);
  
  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push API not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const backendUrl = "https://accounts.remindarin.orbmiv.com";
        const resp = await fetch(`${backendUrl}/api/v1/push/vapid-public-key`);
        if (!resp.ok) throw new Error('Failed to fetch VAPID key');
        const { public_key } = await resp.json();

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: public_key
        });
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No auth token found for push subscription');
        return;
      }

      const backendUrl = "https://accounts.remindarin.orbmiv.com";
      const res = await fetch(`${backendUrl}/api/v1/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subscription })
      });

      if (res.ok) {
        console.log('✅ Push subscription registered successfully with backend');
      } else {
        console.error('Failed to register subscription with backend');
      }
    } catch (err) {
      console.error('Push subscription failed:', err);
    }
  };

    function PushNotificationManager() {
    const { user } = useAuth();
    const [askPermission, setAskPermission] = useState(false);

    useEffect(() => {
      if (!user) {
        setAskPermission(false);
        return;
      }
      if (Notification.permission === 'granted') {
        subscribeToPush();
        setAskPermission(false);
        return;
      }
      if (Notification.permission === 'default') {
        setAskPermission(true);
      } else {
        setAskPermission(false);
      }
    }, [user]);

    const handleEnableClick = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          await subscribeToPush();
        }
      } finally {
        setAskPermission(false);
      }
    };

    if (!askPermission) return null;

    return (
      <div className="fixed inset-x-0 bottom-0 z-[999] bg-white dark:bg-foundation border-t border-border rounded-t-3xl shadow-2xl flex flex-col">
        <div className="mx-auto w-12 h-1 bg-text-secondary/30 dark:bg-text-secondary/30 rounded-full mt-3 mb-6 flex-shrink-0"></div>
        <div className="px-6 pb-8 flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl">🔔</span>
            <div className="flex-1">
              <div className="font-semibold text-lg text-text-primary">Enable notifications</div>
              <div className="text-sm text-text-secondary mt-1">Get reminded instantly when your reminders are due. Never miss a task again.</div>
            </div>
          </div>
          <button
            onClick={handleEnableClick}
            className="w-full bg-primary text-text-inverse py-4 rounded-2xl font-semibold text-base active:scale-[0.97] transition-all min-h-[44px]"
          >
            Enable Notifications
          </button>
          <button
            onClick={() => setAskPermission(false)}
            className="w-full text-text-secondary font-medium py-3 text-base active:scale-[0.97] transition-all"
          >
            Not now
          </button>
        </div>
      </div>
    );
  }

    return (
    <AuthProvider>
      <PushNotificationManager />

      <Router>
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