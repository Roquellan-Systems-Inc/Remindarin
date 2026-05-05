import React from 'react';
import { Lightbulb, Plus } from 'lucide-react';

export default function SmartSuggestions({ onAdd }) {
  const hour = new Date().getHours();
  
  const suggestions = hour < 10 
    ? ["Review top 3 priorities", "Hydrate & 5-min stretch", "Plan your first deep work block"]
    : hour < 15 
    ? ["Block 45 min for focused work", "Quick stand-up with team", "Log today's wins"]
    : ["Prepare tomorrow's top 3", "Review incomplete items", "Wind-down routine"];

  return (
    <div className="bg-foundation rounded-3xl p-6 border border-border">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-2xl bg-warning/10 flex items-center justify-center">
          <Lightbulb className="text-warning" size={18} />
        </div>
        <div className="font-semibold text-lg">Smart Suggestions</div>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onAdd(suggestion)}
            className="w-full flex items-center justify-between bg-background hover:bg-white dark:hover:bg-white/5 border border-border rounded-2xl px-5 py-4 text-left transition-all active:scale-[0.985] group"
          >
            <span className="text-sm font-medium pr-4">{suggestion}</span>
            <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-text-inverse transition-colors flex-shrink-0">
              <Plus size={15} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}