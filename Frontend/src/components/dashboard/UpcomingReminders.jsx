import React, { useState } from 'react';
import { Check, Clock } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function UpcomingReminders({ reminders, onComplete, isLoading = false }) {
  const [completingIds, setCompletingIds] = useState(new Set());

  const handleComplete = async (id) => {
    setCompletingIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    try {
      await onComplete(id);
    } catch (error) {
      console.error('Failed to complete reminder:', error);
    } finally {
      setCompletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };
  if (isLoading) {
    return (
      <div className="bg-foundation rounded-3xl border border-border p-8 flex items-center justify-center h-64">
        <LoadingSpinner size={32} />
      </div>
    );
  }

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
                {upcoming.map((reminder) => {
          const isCompleting = completingIds.has(reminder.id);
          return (
            <div 
              key={reminder.id} 
              className={`px-6 py-4 flex items-center gap-4 group transition-all duration-200 ${isCompleting ? 'opacity-70' : ''}`}
            >
              <button
                onClick={() => handleComplete(reminder.id)}
                disabled={isCompleting}
                className="w-9 h-9 rounded-2xl border-2 border-border flex-shrink-0 flex items-center justify-center hover:border-accent-positive active:scale-[0.92] transition-all disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={`Mark "${reminder.text}" as complete`}
              >
                {isCompleting ? (
                  <div className="w-4 h-4 border-[2.5px] border-accent-positive border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check 
                    size={18} 
                    className="text-accent-positive opacity-0 group-hover:opacity-100 transition-all duration-200" 
                  />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className={`font-medium text-text-primary pr-2 transition-all ${isCompleting ? 'line-through text-text-secondary' : ''}`}>
                  {reminder.text}
                </div>
                <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                  <Clock size={12} />
                  {reminder.time} • {reminder.context}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}