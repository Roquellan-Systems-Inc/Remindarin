import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
  return (
    <AuthProvider>
      <Router>
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