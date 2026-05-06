import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = "https://accounts.remindarin.orbmiv.com";

export default function QuickCapture() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [newReminder, setNewReminder] = useState({ 
    text: '', 
    time: '09:00', 
    date: new Date().toISOString().split('T')[0],
    context: 'Work' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const getToken = () => {
    if (!user?.id || !user?.email) {
      navigate('/login');
      return null;
    }
    return btoa(`${user.id}:${user.email}`);
  };

  const addReminder = async () => {
    const token = getToken();
    if (!token || !newReminder.text.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/reminders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: newReminder.text.trim(),
          time: newReminder.time,
          date: newReminder.date,
          context: newReminder.context
        })
      });

      if (res.ok) {
        setToast({ message: "✅ Reminder added successfully!", type: "success" });
        setNewReminder({ 
          text: '', 
          time: '09:00', 
          date: new Date().toISOString().split('T')[0], 
          context: 'Work' 
        });
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "❌ Failed to add reminder", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <span className="font-semibold text-xl">Quick Capture</span>
          </div>
        </div>
      </div>

      <div className="pt-20 px-6 max-w-3xl mx-auto">
        <div className="bg-foundation rounded-3xl p-6 space-y-8">
          <div>
            <div className="text-sm font-medium mb-2 text-text-secondary">WHAT NEEDS TO BE DONE?</div>
            <input
              type="text"
              value={newReminder.text}
              onChange={(e) => setNewReminder({...newReminder, text: e.target.value})}
              placeholder="e.g. Finish investor deck"
              className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium mb-2 text-text-secondary">DATE</div>
              <input
                type="date"
                value={newReminder.date}
                onChange={(e) => setNewReminder({...newReminder, date: e.target.value})}
                className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <div className="text-sm font-medium mb-2 text-text-secondary">TIME</div>
              <input
                type="time"
                value={newReminder.time}
                onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <div className="text-sm font-medium mb-2 text-text-secondary">CONTEXT</div>
              <select
                value={newReminder.context}
                onChange={(e) => setNewReminder({...newReminder, context: e.target.value})}
                className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-primary"
              >
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Health">Health</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <button 
            onClick={addReminder}
            disabled={!newReminder.text.trim() || isSubmitting}
            className="w-full h-14 bg-primary text-text-inverse rounded-2xl font-semibold text-lg active:scale-[0.985] transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                Adding...
              </>
            ) : (
              "Add Reminder"
            )}
          </button>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] px-6 py-3 rounded-2xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-accent-positive text-text-inverse' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}