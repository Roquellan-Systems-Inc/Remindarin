import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Bot } from 'lucide-react';
import TodaysOverview from '../components/dashboard/TodaysOverview';
import QuickCaptureButton from '../components/dashboard/QuickCaptureButton';
import UpcomingReminders from '../components/dashboard/UpcomingReminders';
import DailyStats from '../components/dashboard/DailyStats';
import SmartSuggestions from '../components/dashboard/SmartSuggestions';
import QuickActions from '../components/dashboard/QuickActions';

export default function Dashboard() {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([
    { id: 1, text: "Team sync meeting", time: "09:00", context: "Work", completed: false },
    { id: 2, text: "Submit Q2 report draft", time: "11:30", context: "Work", completed: false },
    { id: 3, text: "30-min walk", time: "17:00", context: "Health", completed: false },
    { id: 4, text: "Call mom", time: "19:30", context: "Personal", completed: false }
  ]);
  const [energyLevel, setEnergyLevel] = useState('medium');
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [newReminder, setNewReminder] = useState({ text: '', time: '09:00', context: 'Work' });
  const [showFocusModal, setShowFocusModal] = useState(false);
  const [focusTime, setFocusTime] = useState(25 * 60);
  const [isFocusRunning, setIsFocusRunning] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const completedToday = reminders.filter(r => r.completed).length;
  const streak = 12;

  const addReminder = (text, time = '09:00', context = 'Work') => {
    const newItem = {
      id: Date.now(),
      text,
      time,
      context,
      completed: false
    };
    setReminders(prev => [...prev, newItem]);
  };

  const completeReminder = (id) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: true } : r));
  };

  const handleQuickCapture = () => {
    setNewReminder({ text: '', time: '09:00', context: 'Work' });
    setShowCaptureModal(true);
  };

  const submitNewReminder = () => {
    if (!newReminder.text.trim()) return;
    addReminder(newReminder.text.trim(), newReminder.time, newReminder.context);
    setShowCaptureModal(false);
    setNewReminder({ text: '', time: '09:00', context: 'Work' });
  };

  const handlePlanDay = () => {
    const samples = [
      { text: "Morning deep work block", time: "08:00", context: "Work" },
      { text: "Lunch & recharge", time: "12:30", context: "Health" },
      { text: "End-of-day review", time: "17:30", context: "Work" }
    ];
    samples.forEach(s => addReminder(s.text, s.time, s.context));
  };

  const handleReviewYesterday = () => {
    setShowReviewModal(true);
  };

  const handleFocusMode = () => {
    setFocusTime(25 * 60);
    setIsFocusRunning(true);
    setShowFocusModal(true);
  };

  const handleSuggestionAdd = (suggestion) => {
    addReminder(suggestion, '10:00', 'Work');
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
            <TodaysOverview energyLevel={energyLevel} setEnergyLevel={setEnergyLevel} />
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
        className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-text-inverse shadow-lg hover:bg-[#2B3A67] active:scale-95 transition-all"
        aria-label="Open AI Assistant"
      >
        <Bot size={24} />
      </button>

      {showCaptureModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-6">
          <div className="bg-foundation rounded-3xl w-full max-w-md border border-border overflow-hidden">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div className="font-semibold text-xl">New Reminder</div>
              <button onClick={() => setShowCaptureModal(false)} className="text-text-secondary hover:text-text-primary">
                <X size={22} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
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
                onClick={() => setShowCaptureModal(false)}
                className="flex-1 h-12 rounded-2xl border border-border font-medium hover:bg-background transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={submitNewReminder}
                disabled={!newReminder.text.trim()}
                className="flex-1 h-12 rounded-2xl bg-primary text-text-inverse font-semibold disabled:opacity-40 active:scale-[0.985] transition-all"
              >
                Add Reminder
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
    </div>
  );
}