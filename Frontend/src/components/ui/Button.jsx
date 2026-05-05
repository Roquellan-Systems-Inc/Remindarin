import React from 'react';

export default function Button({ children, onClick, className = '', variant = 'primary', ...props }) {
  const base = 'inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.985] disabled:opacity-60';
  const styles = {
    primary: 'bg-primary text-text-inverse hover:bg-primary/90 focus:ring-primary shadow-sm',
    secondary: 'border border-border bg-transparent text-text-primary hover:bg-foundation focus:ring-primary',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-foundation/80',
  };
  return <button onClick={onClick} className={`${base} ${styles[variant]} ${className}`} {...props}>{children}</button>;
}