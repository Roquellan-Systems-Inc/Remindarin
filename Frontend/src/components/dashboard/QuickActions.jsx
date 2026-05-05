import React from 'react';
import Button from '../../ui/Button';
import { Calendar, Clock, Target } from 'lucide-react';

export default function QuickActions({ onPlanDay, onReviewYesterday, onFocusMode }) {
  return (
    <div className="bg-foundation rounded-3xl p-6 border border-border">
      <div className="font-semibold text-lg mb-5">Quick Actions</div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button 
          onClick={onPlanDay}
          className="h-14 justify-start gap-3 text-sm"
        >
          <Calendar size={18} /> Plan My Day
        </Button>
        
        <Button 
          variant="ghost" 
          onClick={onReviewYesterday}
          className="h-14 justify-start gap-3 text-sm border border-border"
        >
          <Clock size={18} /> Review Yesterday
        </Button>
        
        <Button 
          onClick={onFocusMode}
          className="h-14 justify-start gap-3 text-sm bg-accent-positive hover:bg-emerald-600 text-white"
        >
          <Target size={18} /> Focus Mode
        </Button>
      </div>
    </div>
  );
}