import React, { useState, useEffect } from 'react';
import { Lightbulb, Plus, Check } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function SmartSuggestions({ onAdd }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
   const [addingIds, setAddingIds] = useState(new Set());
  const [successIds, setSuccessIds] = useState(new Set());
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
  
    const handleAdd = async (suggestion, index) => {
    const id = index;

    setAddingIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    setSuccessIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    try {
      await onAdd(suggestion);

      setSuccessIds(prev => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      // Elegant 1.2s success flash then reset (iOS-style toggle)
      setTimeout(() => {
        setSuccessIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 1200);
    } catch (err) {
      console.error("Failed to add suggestion", err);
    } finally {
      setAddingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

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
                    suggestions.map((suggestion, index) => {
            const isAdding = addingIds.has(index);
            const isSuccess = successIds.has(index);
            return (
              <button
                key={index}
                onClick={() => handleAdd(suggestion, index)}
                disabled={isAdding || isSuccess}
                className="w-full flex items-center justify-between bg-background hover:bg-white dark:hover:bg-white/5 border border-border rounded-2xl px-5 py-4 text-left transition-all active:scale-[0.985] group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className={`text-sm font-medium pr-4 transition-all duration-200 ${isSuccess ? 'text-accent-positive line-through' : ''}`}>{suggestion}</span>
                <div 
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    isSuccess 
                      ? 'bg-accent-positive/10' 
                      : 'bg-primary/5 group-hover:bg-primary group-hover:text-text-inverse'
                  }`}
                >
                  {isAdding ? (
                    <div className="w-4 h-4 border-[2.5px] border-accent-positive border-t-transparent rounded-full animate-spin" />
                  ) : isSuccess ? (
                    <Check size={16} className="text-accent-positive" />
                  ) : (
                    <Plus size={15} />
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}