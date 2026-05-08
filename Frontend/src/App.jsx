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
import BottomSheet from './components/ui/BottomSheet';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  // PWA Install Banner (global - appears at top of Dashboard)
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setShowInstallBanner(false);
    setDeferredPrompt(null);
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

  return (
    <AuthProvider>
      <Router>
        <BottomSheet
          isOpen={showInstallBanner && !!deferredPrompt}
          onClose={() => {
            setShowInstallBanner(false);
            setDeferredPrompt(null);
          }}
        >
          <div className="px-6 py-8 bg-background dark:bg-foundation flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-3xl flex items-center justify-center flex-shrink-0">
                <span className="text-text-inverse font-bold text-3xl">R</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg">Download the app</div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-accent-positive font-medium">4.9</span>
                  <span className="text-yellow-400">★★★★★</span>
                  <span className="text-text-secondary text-xs">• 2M+</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleInstallClick}
              className="w-full bg-primary text-text-inverse py-4 rounded-3xl font-semibold text-base active:scale-95 transition-all"
            >
              Get Remindarin
            </button>
          </div>
        </BottomSheet>

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