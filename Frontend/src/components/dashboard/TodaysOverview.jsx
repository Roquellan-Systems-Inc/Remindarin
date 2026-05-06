import React from 'react';
import { Sun, Calendar } from 'lucide-react';

export default function TodaysOverview({ energyLevel, setEnergyLevel, weather }) {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric' 
  });

  const energyOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  return (
    <div className="bg-foundation rounded-3xl p-6 border border-border">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-text-secondary text-sm font-medium">
            <Calendar size={16} />
            TODAY
          </div>
          <div className="text-2xl font-semibold text-text-primary mt-1 tracking-tight">{today}</div>
        </div>
        
      <div className="flex items-center gap-3 bg-background rounded-2xl px-5 py-3 border border-border">
          <Sun size={22} className="text-warning" />
          <div>
            <div className="text-xs text-text-secondary">WEATHER</div>
            <div className="font-semibold text-text-primary">{weather.temp}°C • {weather.condition}</div>
          </div>
        </div>
      </div>

      <div>
        <div className="text-sm font-medium text-text-secondary mb-3">ENERGY LEVEL</div>
        <div className="grid grid-cols-3 gap-3">
          {energyOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setEnergyLevel(opt.value)}
              className={`h-12 rounded-2xl text-sm font-semibold transition-all active:scale-[0.985] ${energyLevel === opt.value 
                ? 'bg-primary text-text-inverse shadow-sm' 
                : 'bg-background border border-border hover:border-primary/40 text-text-primary'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}