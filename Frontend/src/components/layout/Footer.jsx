import React from 'react';

export default function Footer() {
  const links = ['Home', 'Features', 'Blog', 'Privacy', 'Terms'];
  return (
    <footer className="bg-foundation border-t border-border py-16">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-y-12">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-primary rounded-2xl flex items-center justify-center">
              <span className="text-text-inverse font-bold">R</span>
            </div>
            <span className="font-semibold text-xl text-text-primary">Remindarin</span>
          </div>
          <p className="text-text-secondary max-w-xs">The context-aware reminder that actually works.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="font-semibold text-text-primary mb-4">Product</div>
            <div className="space-y-2 text-text-secondary">
              {links.slice(0,3).map(l => <div key={l}>{l}</div>)}
            </div>
          </div>
          <div>
            <div className="font-semibold text-text-primary mb-4">Company</div>
            <div className="space-y-2 text-text-secondary">
              {links.slice(3).map(l => <div key={l}>{l}</div>)}
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="font-semibold text-text-primary mb-4">Connect</div>
            <div className="space-y-2 text-text-secondary">
              <div>Twitter</div>
              <div>LinkedIn</div>
              <div>Instagram</div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-border text-center text-sm text-text-secondary">
        © {new Date().getFullYear()} Remindarin. All rights reserved.
      </div>
    </footer>
  );
}