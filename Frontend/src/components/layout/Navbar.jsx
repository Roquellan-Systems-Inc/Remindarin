import React, { useState } from 'react';
import Button from '../ui/Button';
import { Menu, X, Shield } from 'lucide-react';

export default function Navbar({ onWaitlistClick, onDevClick }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = [
    { label: 'Problem', id: 'problem' },
    { label: 'How it Works', id: 'how' },
    { label: 'Benefits', id: 'benefits' },
    { label: 'Stories', id: 'testimonials' },
  ];
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 56;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setMobileOpen(false);
  };
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 dark:bg-foundation/95 backdrop-blur-lg border-b border-border dark:border-border py-2">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-2xl flex items-center justify-center">
            <span className="text-text-inverse font-bold text-xl">R</span>
          </div>
          <div className="font-semibold text-2xl tracking-tight text-text-primary">Remindarin</div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map(link => (
            <button key={link.id} onClick={() => scrollTo(link.id)} className="text-text-secondary hover:text-text-primary transition-colors">
              {link.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onDevClick} className="hidden md:flex items-center gap-2 text-sm">
            <Shield size={16} /> Dev
          </Button>
          <Button onClick={onWaitlistClick} className="hidden md:block">Join Waitlist</Button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-3 text-text-primary">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background dark:bg-foundation px-6 py-6 flex flex-col gap-4 text-sm">
          {navLinks.map(link => (
            <button key={link.id} onClick={() => scrollTo(link.id)} className="text-left py-2 text-text-secondary hover:text-text-primary">{link.label}</button>
          ))}
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            <Button variant="ghost" onClick={onDevClick} className="justify-start">Developer Dashboard</Button>
            <Button onClick={onWaitlistClick}>Join Waitlist</Button>
          </div>
        </div>
      )}
    </nav>
  );
}