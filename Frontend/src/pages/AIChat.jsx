import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';
import offlineDB from '../services/offlineDB';
import AIChatHeader from '../components/layout/AIChatHeader';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://accounts.remindarin.orbmiv.com';

export default function AIChat() {
  const navigate = useNavigate();
  const { user } = useAuth();                    // ← Added auth
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  
  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Generate the same Bearer token the backend expects
  const getToken = () => {
    if (!user?.id || !user?.email) return null;
    const tokenStr = `${user.id}:${user.email}`;
    return btoa(tokenStr);   // base64 exactly like backend
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        scrollToBottom();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

    const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    const isOnline = navigator.onLine;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setMessages(prev => [...prev, { role: 'user', text: userMsg, timestamp: Date.now() }]);
    setInput('');
    setShowWelcome(false);
    setIsTyping(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      if (isOnline) {
        const token = getToken();
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ message: userMsg }),
          signal: controller.signal,
        });

        if (response.status === 401) {
          navigate('/login');
          return;
        }

        if (!response.ok) throw new Error('Failed to connect');

        const data = await response.json();
        const aiReply = data.reply || "I received your message.";
        
        setMessages(prev => [...prev, { role: 'ai', text: aiReply, timestamp: Date.now() }]);
        
        await offlineDB.cacheAIResponse(userMsg.toLowerCase(), aiReply);
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const history = await offlineDB.getChatHistory();
        let localReply = "I'm working offline. Here's what I remember from our last chats:";
        
        if (history.length > 0) {
          const lastAI = history.filter(m => m.role === 'ai').slice(-3);
          if (lastAI.length > 0) localReply += `\n\n${lastAI.map(m => m.text).join('\n• ')}`;
        } else {
          const lower = userMsg.toLowerCase();
          if (lower.includes('reminder') || lower.includes('task')) localReply = "You can create reminders even offline. Try saying 'remind me to call mom at 5pm' later.";
          else if (lower.includes('today') || lower.includes('plan')) localReply = "Offline mode: Your streak is safe. Focus on high-energy tasks first.";
          else localReply = "Offline AI: Great question! I'll remember this for when we're back online.";
        }
        
        setMessages(prev => [...prev, { role: 'ai', text: localReply, timestamp: Date.now(), offline: true }]);
      }

      await offlineDB.saveChatMessage({ role: 'user', text: userMsg });
      const lastMessage = messages[messages.length - 1];
      if (lastMessage) await offlineDB.saveChatMessage(lastMessage);

    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "I'm offline but still here. What would you like to do?", 
        offline: true 
      }]);
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      <AIChatHeader navigate={navigate} isOnline={navigator.onLine} />

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 pt-20 pb-24 overflow-y-auto">
        {showWelcome && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="text-4xl font-semibold tracking-tight mb-3">RemindArin</div>
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
                : 'bg-foundation border border-border rounded-bl-none prose prose-invert max-w-none'}`}>
               {msg.role === 'ai' ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-6 rounded-3xl border border-border bg-foundation shadow-sm">
                          <table 
                            className="w-full text-sm border-collapse" 
                            {...props} 
                          />
                        </div>
                      ),
                      thead: ({ node, ...props }) => (
                        <thead 
                          className="bg-primary/5 border-b border-border" 
                          {...props} 
                        />
                      ),
                      th: ({ node, ...props }) => (
                        <th 
                          className="px-6 py-4 text-left font-semibold text-text-primary border-r border-border last:border-r-0" 
                          {...props} 
                        />
                      ),
                      tbody: ({ node, ...props }) => (
                        <tbody 
                          className="divide-y divide-border" 
                          {...props} 
                        />
                      ),
                      tr: ({ node, ...props }) => (
                        <tr 
                          className="hover:bg-background/70 transition-colors" 
                          {...props} 
                        />
                      ),
                      td: ({ node, ...props }) => (
                        <td 
                          className="px-6 py-4 text-text-primary border-r border-border last:border-r-0 align-top" 
                          {...props} 
                        />
                      ),
                      p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
                      li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-semibold text-text-primary" {...props} />,
                      code: ({ node, inline, ...props }) => 
                        inline ? (
                          <code className="bg-background px-1.5 py-px rounded text-xs font-mono text-accent-positive" {...props} />
                        ) : (
                          <code className="block bg-foundation p-4 rounded-3xl overflow-x-auto text-sm font-mono border border-border" {...props} />
                        )
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text
                )}
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
          <div ref={messagesEndRef} />
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