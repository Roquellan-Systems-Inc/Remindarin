import React from 'react';
import { ArrowLeft } from 'lucide-react';
import offlineDB from '../../services/offlineDB';

export default function AIChatHeader({ navigate, isOnline }) {
  const handleSaveFile = async () => {
    const history = await offlineDB.getChatHistory();
    const markdown = history
      .map(m => `${m.role === 'user' ? 'You' : 'AI'}: ${m.text}`)
      .join('\n\n');
    const saved = await offlineDB.saveToLocalFile(
      markdown,
      `remindarin-chat-${new Date().toISOString().slice(0,10)}.md`
    );
    if (saved) alert('✅ Chat saved to your device files!');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-foundation/95 backdrop-blur-lg border-b border-border">
      <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Back button */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
        </div>

        {/* Center: Title */}
        <div className="font-semibold text-xl text-text-primary tracking-tight">
          RemindArin AI
        </div>

        {/* Right side: Save button + Online status + Menu */}
        <div className="flex items-center gap-3">
          {/* Save as file button */}
          <button
            onClick={handleSaveFile}
            className="flex items-center gap-1.5 text-xs px-4 h-9 bg-foundation border border-border rounded-2xl hover:border-primary/50 transition-colors text-text-secondary hover:text-text-primary"
          >
            💾 Save
          </button>

          {/* Online / Offline status */}
          <div className={`flex items-center gap-1.5 text-xs px-4 h-9 rounded-2xl font-medium ${
            isOnline 
              ? 'bg-accent-positive text-white' 
              : 'bg-warning text-text-inverse'
          }`}>
            {isOnline ? '🟢 Online' : '📴 Offline'}
          </div>

          {/* Menu button (top right) */}
          <button 
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Menu"
          >
            ⋮
          </button>
        </div>
      </div>
    </div>
  );
}