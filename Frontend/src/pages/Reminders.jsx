import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/layout/BottomNav';

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
    <div className="min-h-screen bg-background text-text-primary pb-20">
      <div className="pt-8 px-6 max-w-3xl mx-auto">
        <div className="text-3xl font-semibold tracking-tighter mb-8">Reminders</div>
        
        {isLoading ? (
          <div className="text-center py-12 text-text-secondary">Loading reminders...</div>
        ) : reminders.length === 0 ? (
          <div className="bg-foundation rounded-3xl p-12 text-center">
            <div className="text-6xl mb-6">🎯</div>
            <div className="text-2xl font-medium">All caught up!</div>
            <div className="text-text-secondary mt-3">No active reminders right now.</div>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="bg-foundation rounded-3xl p-6 flex items-center justify-between group">
                <div className="flex-1">
                  <div className="font-medium">{reminder.text}</div>
                  <div className="flex items-center gap-3 text-sm text-text-secondary mt-3">
                    <span>{reminder.date || 'Today'}</span>
                    {reminder.time && <span className="font-mono">{reminder.time}</span>}
                    <span className="px-3 py-1 bg-background rounded-full text-xs">{reminder.context}</span>
                  </div>
                </div>
                <button
                  onClick={() => completeReminder(reminder.id)}
                  className="text-emerald-500 hover:text-emerald-600 transition-colors p-2"
                >
                  <CheckCircle size={36} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav activeTab="reminders" />
    </div>
  );
}