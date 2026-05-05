import React from 'react';
import { Flame, CheckCircle } from 'lucide-react';

export default function DailyStats({ completedToday, streak }) {
  return (
    <div className="bg-foundation rounded-3xl p-6 border border-border h-full flex flex-col">
      <div className="font-semibold text-lg mb-6">Today's Progress</div>
      
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        <div className="flex items-baseline gap-1">
          <span className="text-6xl font-semibold text-accent-positive tabular-nums">{completedToday}</span>
          <span className="text-2xl text-text-secondary">/ 12</span>
        </div>
        <div className="text-sm text-text-secondary mt-1">reminders completed</div>
      </div>

      <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-accent-positive/10 flex items-center justify-center">
            <Flame className="text-accent-positive" size={20} />
          </div>
          <div>
            <div className="text-2xl font-semibold tabular-nums">{streak}</div>
            <div className="text-xs text-text-secondary -mt-0.5">day streak</div>
          </div>
        </div>
        <CheckCircle className="text-accent-positive" size={28} />
      </div>
    </div>
  );
}