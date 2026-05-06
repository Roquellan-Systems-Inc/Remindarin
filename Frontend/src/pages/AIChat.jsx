import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://remindarin.onrender.com';

export default function AIChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setShowWelcome(false);
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!response.ok) throw new Error('Failed to connect');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply || "I received your message." }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "Sorry, I'm having trouble connecting to the AI right now. Please check if the backend is running and NVIDIA_API_KEY is set in Render." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 bg-foundation/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="p-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={22} />
            </button>
            <div className="w-9 h-9 bg-primary rounded-2xl flex items-center justify-center">
              <Bot size={18} className="text-text-inverse" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 pt-20 pb-24 overflow-y-auto">
        {showWelcome && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mb-8">
              <Bot size={40} className="text-text-inverse" />
            </div>
            <div className="text-4xl font-semibold tracking-tight mb-3">Remindarin AI</div>
            <div className="text-xl text-text-secondary max-w-xs">Your personal assistant for smarter reminders and better days.</div>
            
            <div className="mt-12 grid grid-cols-1 gap-3 w-full max-w-xs">
              {[
                "Help me plan my day",
                "What should I focus on now?",
                "How's my streak looking?"
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(prompt);
                    setTimeout(() => sendMessage(), 100);
                  }}
                  className="text-left px-5 py-4 bg-foundation border border-border rounded-2xl hover:border-primary/50 transition-colors text-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6 py-8">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-6 py-4 rounded-3xl text-[15px] leading-relaxed ${msg.role === 'user' 
                ? 'bg-primary text-text-inverse rounded-br-none' 
                : 'bg-foundation border border-border rounded-bl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-foundation border border-border px-6 py-4 rounded-3xl rounded-bl-none flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-xs text-text-secondary ml-1">AI is thinking...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-foundation border-t border-border p-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask anything about your day, reminders, or energy..."
            className="flex-1 bg-background border border-border rounded-2xl px-6 py-4 text-[15px] focus:outline-none focus:border-primary"
          />
          <button 
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-text-inverse disabled:opacity-40 active:scale-95 transition-all"
          >
            <Send size={20} />
          </button>
        </div>
        <div className="text-center text-xs text-text-secondary mt-3">Your conversations are private and encrypted</div>
      </div>
    </div>
  );
}