import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Reminders() {
  const { token } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [newText, setNewText] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newContext, setNewContext] = useState('Work');
  const [submitting, setSubmitting] = useState(false);

  const backendUrl = "https://accounts.remindarin.orbmiv.com";

  const fetchReminders = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/api/v1/reminders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReminders(data.reminders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createReminder = async (e) => {
    e.preventDefault();
    if (!newText.trim() || !token) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${backendUrl}/api/v1/reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: newText.trim(),
          time: newTime || null,
          date: newDate || null,
          context: newContext
        })
      });
      if (res.ok) {
        setNewText('');
        setNewTime('');
        setNewDate('');
        setShowBottomSheet(false);
        fetchReminders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const completeReminder = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/reminders/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchReminders();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchReminders();
  }, [token]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-6 pt-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-text-primary">Reminders</h1>
          <div className="text-sm font-medium text-text-secondary">
            {reminders.length} active
          </div>
        </div>

        <button
          onClick={() => setShowBottomSheet(true)}
          className="w-full h-14 bg-primary text-text-inverse rounded-3xl flex items-center justify-center gap-3 text-lg font-semibold active:scale-[0.97] transition-all mb-8"
        >
          <span className="text-2xl leading-none">+</span>
          <span>New Reminder</span>
        </button>

        {loading ? (
          <div className="text-center py-12 text-text-secondary">Loading reminders...</div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-16 text-text-secondary">
            <div className="text-6xl mb-4">📌</div>
            <p className="text-xl font-medium">No active reminders yet</p>
            <p className="text-sm mt-2">Create one above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((r) => (
              <div
                key={r.id}
                className="bg-white dark:bg-foundation border border-border rounded-3xl p-6 flex items-start gap-4 hover:border-primary/30 transition-colors"
              >
                <input
                  type="checkbox"
                  onChange={() => completeReminder(r.id)}
                  className="mt-1 w-5 h-5 accent-accent-positive cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary leading-tight">{r.text}</p>
                  <div className="flex items-center gap-3 mt-3 text-sm">
                    {r.date && <span className="text-text-secondary">{r.date}</span>}
                    {r.time && <span className="text-text-secondary">{r.time}</span>}
                    <span className="px-4 py-1 text-xs font-medium bg-accent-positive/10 text-accent-positive rounded-2xl">
                      {r.context}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      {showBottomSheet && (
        <div
          className="fixed inset-0 bg-black/60 z-[9999] flex items-end"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowBottomSheet(false);
          }}
        >
          <div
            className="w-full max-w-2xl mx-auto bg-white dark:bg-foundation rounded-t-3xl shadow-2xl overflow-hidden transition-transform duration-300"
            style={{ transform: showBottomSheet ? 'translateY(0)' : 'translateY(100%)' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-4 pb-2">
              <div
                className="w-12 h-1.5 bg-border rounded-full cursor-grab active:cursor-grabbing"
                onPointerDown={() => setShowBottomSheet(false)}
              />
            </div>

            <div className="px-6 pb-8">
              <h2 className="text-2xl font-semibold mb-6">Create new reminder</h2>

              <form onSubmit={createReminder} className="space-y-6">
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="What do you want to be reminded about?"
                  className="w-full px-6 py-5 text-lg border border-border focus:border-primary rounded-3xl outline-none"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-2">DATE</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-5 py-4 border border-border rounded-3xl text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-2">TIME</label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-5 py-4 border border-border rounded-3xl text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">CONTEXT</label>
                  <div className="flex gap-2">
                    {['Work', 'Personal', 'Health', 'Other'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewContext(c)}
                        className={`flex-1 py-4 rounded-3xl text-sm font-medium transition-all ${
                          newContext === c
                            ? 'bg-primary text-text-inverse'
                            : 'bg-white dark:bg-foundation border border-border'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBottomSheet(false)}
                    className="flex-1 h-14 border border-border rounded-3xl font-medium text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !newText.trim()}
                    className="flex-1 h-14 bg-primary text-text-inverse rounded-3xl font-semibold disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Reminder'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}