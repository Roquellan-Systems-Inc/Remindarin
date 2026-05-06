import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Bot } from 'lucide-react';
import TodaysOverview from '../components/dashboard/TodaysOverview';
import QuickCaptureButton from '../components/dashboard/QuickCaptureButton';
import UpcomingReminders from '../components/dashboard/UpcomingReminders';
import DailyStats from '../components/dashboard/DailyStats';
import SmartSuggestions from '../components/dashboard/SmartSuggestions';
import QuickActions from '../components/dashboard/QuickActions';
import BottomNav from '../components/layout/BottomNav';

export default function Dashboard() {
  const navigate = useNavigate();
  const API_BASE = "https://remindarin.onrender.com";
  const [reminders, setReminders] = useState([]);
  const [completedToday, setCompletedToday] = useState(0);
  const [streak, setStreak] = useState(12);
  const [energyLevel, setEnergyLevel] = useState('medium');
  const [weather, setWeather] = useState({ temp: 29, condition: "Clear skies" });
  const [showCaptureSheet, setShowCaptureSheet] = useState(false);
  const [newReminder, setNewReminder] = useState({ text: '', time: '09:00', context: 'Work' });
  const [showFocusModal, setShowFocusModal] = useState(false);
  const [focusTime, setFocusTime] = useState(25 * 60);
  const [isFocusRunning, setIsFocusRunning] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/dashboard`);
      const data = await res.json();
      setReminders(data.reminders || []);
      setCompletedToday(data.completed_today || 0);
      setStreak(data.streak || 12);
      setEnergyLevel(data.energy_level || 'medium');
      setWeather(data.weather || { temp: 29, condition: "Clear skies" });
    } catch (err) {
      console.error("Failed to fetch dashboard", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addReminder = async (text, time = '09:00', context = 'Work') => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, time, context })
      });
      if (res.ok) {
        await fetchDashboard();
      }
    } catch (err) {
      console.error("Failed to add reminder", err);
    }
  };

    const completeReminder = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/reminders/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        await fetchDashboard();
      }
    } catch (err) {
      console.error("Failed to complete reminder", err);
    }
  };

  const handleQuickCapture = () => {
    setNewReminder({ text: '', time: '09:00', context: 'Work' });
    setShowCaptureSheet(true);
  };

    const submitNewReminder = async () => {
    if (!newReminder.text.trim()) return;

    setIsSubmitting(true);
    setToast(null);

    try {
      await addReminder(newReminder.text.trim(), newReminder.time, newReminder.context);
      setShowCaptureSheet(false);
      setNewReminder({ text: '', time: '09:00', context: 'Work' });
      
      setToast({ message: "✅ Reminder added successfully!", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Failed to add reminder", err);
      setToast({ message: "❌ Failed to save reminder. Please try again.", type: "error" });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

    const handlePlanDay = async () => {
    const samples = [
      { text: "Morning deep work block", time: "08:00", context: "Work" },
      { text: "Lunch & recharge", time: "12:30", context: "Health" },
      { text: "End-of-day review", time: "17:30", context: "Work" }
    ];
    for (const s of samples) {
      await addReminder(s.text, s.time, s.context);
    }
  };

  const handleReviewYesterday = () => {
    setShowReviewModal(true);
  };

  const handleFocusMode = () => {
    setFocusTime(25 * 60);
    setIsFocusRunning(true);
    setShowFocusModal(true);
  };

    const handleSuggestionAdd = async (suggestion) => {
    await addReminder(suggestion, '10:00', 'Work');
  };

  React.useEffect(() => {
    let interval;
    if (isFocusRunning && focusTime > 0) {
      interval = setInterval(() => {
        setFocusTime(t => t - 1);
      }, 1000);
    } else if (focusTime === 0) {
      setIsFocusRunning(false);
      setTimeout(() => {
        setShowFocusModal(false);
        alert("Focus session complete! Great work.");
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isFocusRunning, focusTime]);
  
    React.useEffect(() => {
    fetchDashboard();
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="fixed top-0 left-0 right-0 z-50 bg-foundation/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors p-2 -ml-2"
            >
              <ArrowLeft size={20} />
              <span className="font-medium text-sm">Back to home</span>
            </button>
            <div className="flex items-center gap-3 ml-4">
              <div className="w-9 h-9 bg-primary rounded-2xl flex items-center justify-center">
                <span className="text-text-inverse font-bold text-xl">R</span>
              </div>
              <div>
                <div className="font-semibold text-xl tracking-tight">Remindarin</div>
                <div className="text-[10px] text-text-secondary -mt-1">Dashboard</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="mb-8">
          <div className="text-4xl font-semibold tracking-tighter">Good morning, Ivan.</div>
          <div className="text-text-secondary mt-1">Here's your day at a glance.</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
       <div className="lg:col-span-7">
            <TodaysOverview 
              energyLevel={energyLevel} 
              setEnergyLevel={setEnergyLevel}
              weather={weather}
            />
          </div>
          <div className="lg:col-span-5">
            <QuickCaptureButton onClick={handleQuickCapture} />
          </div>

      <div className="lg:col-span-7">
            <UpcomingReminders reminders={reminders} onComplete={completeReminder} />
          </div>
          <div className="lg:col-span-5">
            <DailyStats completedToday={completedToday} streak={streak} />
          </div>

          <div className="lg:col-span-7">
            <SmartSuggestions onAdd={handleSuggestionAdd} />
          </div>
          <div className="lg:col-span-5">
            <QuickActions 
              onPlanDay={handlePlanDay} 
              onReviewYesterday={handleReviewYesterday} 
              onFocusMode={handleFocusMode} 
            />
          </div>
        </div>
      </div>

   <button
        onClick={() => navigate('/ai')}
        className="fixed bottom-24 right-8 z-[60] w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-text-inverse shadow-lg hover:bg-[#2B3A67] active:scale-95 transition-all"
        aria-label="Open AI Assistant"
      >
        <Bot size={24} />
      </button>

    {showCaptureSheet && (
        <div 
          className="fixed inset-0 z-[70] bg-black/60 flex items-end"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCaptureSheet(false);
          }}
        >
          <div 
            className="bg-foundation w-full max-h-[85vh] rounded-t-3xl border-t border-border overflow-hidden flex flex-col transition-transform duration-300"
            style={{ transform: showCaptureSheet ? 'translateY(0)' : 'translateY(100%)' }}
          >
            <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-text-secondary/30 rounded-full"></div>
            </div>

            <div className="px-6 py-5 border-b border-border">
              <div className="font-semibold text-xl text-center">New Reminder</div>
            </div>
            
            <div className="p-6 space-y-5 flex-1 overflow-auto">
              <div>
                <div className="text-sm font-medium mb-2 text-text-secondary">WHAT NEEDS TO BE DONE?</div>
                <input
                  type="text"
                  value={newReminder.text}
                  onChange={(e) => setNewReminder({ ...newReminder, text: e.target.value })}
                  placeholder="e.g. Prepare investor deck"
                  className="w-full bg-background border border-border rounded-2xl px-5 py-3.5 text-lg focus:outline-none focus:border-primary"
                  autoFocus
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-2 text-text-secondary">TIME</div>
                  <input
                    type="time"
                    value={newReminder.time}
                    onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                    className="w-full bg-background border border-border rounded-2xl px-5 py-3.5 text-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium mb-2 text-text-secondary">CONTEXT</div>
                  <select
                    value={newReminder.context}
                    onChange={(e) => setNewReminder({ ...newReminder, context: e.target.value })}
                    className="w-full bg-background border border-border rounded-2xl px-5 py-3.5 text-lg focus:outline-none focus:border-primary"
                  >
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Health">Health</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 border-t border-border flex gap-3">
              <button 
                onClick={() => setShowCaptureSheet(false)}
                disabled={isSubmitting}
                className="flex-1 h-12 rounded-2xl border border-border font-medium hover:bg-background transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={submitNewReminder}
                disabled={!newReminder.text.trim() || isSubmitting}
                className="flex-1 h-12 rounded-2xl bg-primary text-text-inverse font-semibold disabled:opacity-40 active:scale-[0.985] transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Adding...
                  </>
                ) : (
                  "Add Reminder"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showFocusModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80">
          <div className="text-center">
            <div className="text-[120px] font-semibold tabular-nums tracking-tighter text-white mb-4">
              {formatTime(focusTime)}
            </div>
            <div className="text-white/60 text-xl mb-10">Focus Mode • Deep Work</div>
            
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setIsFocusRunning(!isFocusRunning)}
                className="px-10 py-3.5 rounded-2xl bg-white text-black font-semibold text-sm active:scale-95 transition-all"
              >
                {isFocusRunning ? 'PAUSE' : 'RESUME'}
              </button>
              <button 
                onClick={() => { setShowFocusModal(false); setIsFocusRunning(false); }}
                className="px-10 py-3.5 rounded-2xl border border-white/30 text-white font-semibold text-sm active:scale-95 transition-all"
              >
                END SESSION
              </button>
            </div>
          </div>
        </div>
      )}

    {showReviewModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-6" onClick={() => setShowReviewModal(false)}>
          <div className="bg-foundation rounded-3xl max-w-md w-full p-8 text-center border border-border" onClick={e => e.stopPropagation()}>
            <div className="text-6xl mb-6">📅</div>
            <div className="text-2xl font-semibold mb-3">Yesterday's Review</div>
            <div className="text-text-secondary mb-8">You completed 9 reminders and maintained your 12-day streak. Excellent focus!</div>
            <button 
              onClick={() => setShowReviewModal(false)}
              className="w-full h-12 rounded-2xl bg-primary text-text-inverse font-semibold active:scale-[0.985]"
            >
              Got it, thanks
            </button>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] px-6 py-3 rounded-2xl shadow-lg text-sm font-medium transition-all flex items-center gap-2 ${
          toast.type === 'success' 
            ? 'bg-accent-positive text-text-inverse' 
            : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

    <BottomNav activeTab="home" onCaptureClick={handleQuickCapture} />
    </div>
  );
}