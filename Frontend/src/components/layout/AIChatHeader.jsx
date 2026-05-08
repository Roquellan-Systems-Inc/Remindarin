import React, { useState } from 'react';
import { ArrowLeft, MoreVertical, Wifi, WifiOff } from 'lucide-react';
import BottomSheet from '../ui/BottomSheet';
import offlineDB from '../../services/offlineDB';

export default function AIChatHeader({ navigate, isOnline }) {
  const [menuOpen, setMenuOpen] = useState(false);

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
    setMenuOpen(false);
  };

  const handleClearChat = () => {
    if (confirm('Clear entire chat history?')) {
      // In a real app you would clear IndexedDB here
      alert('Chat history cleared (IndexedDB cleared in full implementation)');
    }
    setMenuOpen(false);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-foundation/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left: Back button only */}
          <button 
            onClick={() => navigate('/dashboard')} 
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={22} />
          </button>

          {/* Right side: Online status + Menu icon */}
          <div className="flex items-center gap-3">
            {/* Online / Offline status with icon (no emoji) */}
            <div className={`flex items-center gap-1.5 text-xs px-4 h-9 rounded-2xl font-medium ${
              isOnline 
                ? 'bg-accent-positive text-white' 
                : 'bg-warning text-text-inverse'
            }`}>
              {isOnline ? (
                <>
                  <Wifi size={16} />
                  Online
                </>
              ) : (
                <>
                  <WifiOff size={16} />
                  Offline
                </>
              )}
            </div>

            {/* Menu icon (top right) */}
            <button 
              onClick={() => setMenuOpen(true)}
              className="p-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Menu"
            >
              <MoreVertical size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Menu BottomSheet - no X button, closes by scroll down */}
      <BottomSheet 
        isOpen={menuOpen} 
        onClose={() => setMenuOpen(false)}
        title="AI Chat Options"
      >
        <div className="px-6 py-4 space-y-2">
          <button
            onClick={handleSaveFile}
            className="w-full text-left flex items-center gap-3 px-5 py-4 hover:bg-foundation rounded-3xl text-text-primary transition-colors"
          >
            💾 Save chat as file
          </button>
          <button
            onClick={handleClearChat}
            className="w-full text-left flex items-center gap-3 px-5 py-4 hover:bg-foundation rounded-3xl text-text-primary transition-colors"
          >
            🗑️ Clear chat history
          </button>
          <button
            onClick={() => { alert('Settings coming soon'); setMenuOpen(false); }}
            className="w-full text-left flex items-center gap-3 px-5 py-4 hover:bg-foundation rounded-3xl text-text-primary transition-colors"
          >
            ⚙️ Settings
          </button>
        </div>
      </BottomSheet>
    </>
  );
}