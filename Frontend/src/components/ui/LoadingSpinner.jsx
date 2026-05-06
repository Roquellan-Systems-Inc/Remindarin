import React from 'react';

export default function LoadingSpinner({ size = 24, className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className="animate-spin border-2 border-text-secondary/30 border-t-text-primary rounded-full"
        style={{ width: size, height: size }}
      />
    </div>
  );
}