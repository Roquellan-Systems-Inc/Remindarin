import React from 'react';

export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-text-secondary">{label}</label>}
      <input 
        className={`w-full bg-foundation border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors ${className}`} 
        {...props} 
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}