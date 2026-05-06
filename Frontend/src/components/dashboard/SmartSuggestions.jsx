import React, { useState, useEffect } from 'react';
import { Lightbulb, Plus } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function SmartSuggestions({ onAdd }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const API_BASE = "https://accounts.remindarin.orbmiv.com";

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/suggestions`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (err) {
        console.error("Failed to fetch smart suggestions", err);
        // Fallback suggestions
        setSuggestions([
          "Review top 3 priorities",
          "Block time for deep work",
          "Prepare tomorrow's plan"
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  return (
    <div className="bg-foundation rounded-3xl p-6 border border-border">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-2xl bg-warning/10 flex items-center justify-center">
          <Lightbulb className="text-warning" size={18} />
        </div>
        <div className="font-semibold text-lg">Smart Suggestions</div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          suggestions.map((suggestion, index) => (
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
          ))
        )}
      </div>
    </div>
  );
}