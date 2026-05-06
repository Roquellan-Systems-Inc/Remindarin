import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, PlusCircle, ListTodo, TrendingUp, User } from 'lucide-react';

export default function BottomNav({ activeTab = 'home', onCaptureClick }) {
  const navigate = useNavigate();

        const tabs = [
    { id: 'home', label: 'Home', icon: Home, action: () => navigate('/dashboard') },
    { id: 'capture', label: 'Capture', icon: PlusCircle, action: () => navigate('/capture') },
    { id: 'reminders', label: 'Reminders', icon: ListTodo, action: () => navigate('/reminders') },
    { id: 'insights', label: 'Insights', icon: TrendingUp, action: () => navigate('/insights') },
    { id: 'profile', label: 'Profile', icon: User, action: () => navigate('/profile') },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-foundation/95 backdrop-blur-xl border border-border rounded-[28px] shadow-xl px-2 py-2 flex items-center gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={tab.action}
              className={`flex flex-col items-center justify-center w-16 h-14 rounded-[20px] transition-all active:scale-95 ${isActive 
                ? 'bg-primary text-text-inverse' 
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
            >
              <Icon size={20} className={isActive ? 'mb-0.5' : ''} />
              <span className="text-[10px] font-medium tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}