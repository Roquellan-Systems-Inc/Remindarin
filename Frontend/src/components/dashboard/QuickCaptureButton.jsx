import React from 'react';
import { Plus } from 'lucide-react';

export default function QuickCaptureButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="group w-full h-full min-h-[140px] bg-primary hover:bg-[#2B3A67] active:bg-[#1F2A44] rounded-3xl flex flex-col items-center justify-center text-text-inverse transition-all active:scale-[0.985] shadow-sm"
    >
      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-active:scale-95 transition-transform">
        <Plus size={32} />
      </div>
      <div className="text-xl font-semibold tracking-tight">Quick Capture</div>
      <div className="text-sm text-white/70 mt-1">Add reminder instantly</div>
    </button>
  );
}