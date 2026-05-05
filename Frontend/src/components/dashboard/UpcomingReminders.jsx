import React from 'react';
import { Check, Clock } from 'lucide-react';

export default function UpcomingReminders({ reminders, onComplete }) {
  const upcoming = reminders
    .filter(r => !r.completed)
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 5);

  if (upcoming.length === 0) {
    return (
      <div className="bg-foundation rounded-3xl p-8 border border-border text-center">
        <div className="text-4xl mb-4">🎉</div>
        <div className="font-semibold text-lg">All caught up!</div>
        <div className="text-text-secondary text-sm mt-1">No upcoming reminders</div>
      </div>
    );
  }

  return (
    <div className="bg-foundation rounded-3xl border border-border overflow-hidden">
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div className="font-semibold text-lg">Upcoming</div>
        <div className="text-xs px-3 py-1 bg-background rounded-full text-text-secondary">{upcoming.length} left</div>
      </div>
      
      <div className="divide-y divide-border">
        {upcoming.map((reminder) => (
          <div key={reminder.id} className="px-6 py-4 flex items-center gap-4 group">
            <button
              onClick={() => onComplete(reminder.id)}
              className="w-6 h-6 rounded-lg border-2 border-border flex-shrink-0 flex items-center justify-center hover:border-accent-positive transition-colors active:scale-90"
            >
              <Check size={14} className="opacity-0 group-hover:opacity-100 text-accent-positive" />
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-text-primary pr-2">{reminder.text}</div>
              <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                <Clock size={12} />
                {reminder.time} • {reminder.context}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}