import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = "https://accounts.remindarin.orbmiv.com";

export default function Reminders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = () => {
    if (!user?.id || !user?.email) {
      navigate('/login');
      return null;
    }
    return btoa(`${user.id}:${user.email}`);
  };

  const fetchReminders = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/v1/reminders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setReminders(data.reminders || []);
    } catch (err) {
      console.error("Failed to fetch reminders", err);
    } finally {
      setIsLoading(false);
    }
  };

  const completeReminder = async (id) => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/v1/reminders/${id}/complete`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchReminders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="fixed top-0 left-0 right-0 z-50 bg-foundation/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 text-center">
            <span className="font-semibold text-xl">Reminders</span>
          </div>
        </div>
      </div>

      <div className="pt-20 px-6 max-w-3xl mx-auto">
        <div className="text-3xl font-semibold tracking-tighter mb-8">All Active Reminders</div>
        
        {isLoading ? (
          <div className="text-center py-12 text-text-secondary">Loading your reminders...</div>
        ) : reminders.length === 0 ? (
          <div className="bg-foundation rounded-3xl p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <div className="font-medium">No active reminders</div>
            <div className="text-text-secondary mt-2">You're all caught up. Great work!</div>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="bg-foundation rounded-3xl p-6 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-lg">{reminder.text}</div>
                  <div className="text-sm text-text-secondary mt-1 flex items-center gap-2">
                    <span>{reminder.date || 'Today'}</span>
                    <span className="text-primary">•</span>
                    <span>{reminder.time}</span>
                    <span className="text-primary">•</span>
                    <span>{reminder.context}</span>
                  </div>
                </div>
                <button
                  onClick={() => completeReminder(reminder.id)}
                  className="text-accent-positive hover:scale-110 transition-transform"
                >
                  <CheckCircle size={32} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}