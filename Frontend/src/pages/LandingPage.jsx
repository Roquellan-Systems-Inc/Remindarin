import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Zap, Clock, Users, PlayCircle, Shield } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import BottomSheet from '../components/ui/BottomSheet';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function LandingPage() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [testNotification, setTestNotification] = useState(false);

  // Automatic dark mode detection (reacts to system changes)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (mediaQuery.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden">
      <Navbar 
        onWaitlistClick={() => setWaitlistOpen(true)} 
        onDevClick={() => setDevOpen(true)} 
      />

      {/* Hero Section */}
      <section className="pt-20 min-h-[100dvh] flex items-center bg-gradient-to-b from-background to-foundation/30 dark:from-foundation dark:to-background/30">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-3xl bg-foundation border border-border mb-6">
            <div className="w-2 h-2 bg-accent-positive rounded-full animate-pulse" />
            <span className="text-xs font-medium tracking-[0.5px] text-text-secondary">NOW IN PRIVATE BETA</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-semibold tracking-tighter leading-[1.05] text-text-primary mb-6">
            Remindarin — The smartest reminder that knows the right time and place.
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-text-secondary mb-10">
            Stop forgetting things. Remindarin understands your schedule, location, and energy — and reminds you exactly when you can actually act.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => setWaitlistOpen(true)} className="text-base px-10">Join the Waitlist</Button>
            <Button variant="secondary" onClick={() => document.getElementById('how').scrollIntoView({ behavior: 'smooth' })} className="text-base px-8 flex items-center gap-2">
              <PlayCircle size={18} /> Watch 30-second demo
            </Button>
          </div>
          <div className="mt-16 text-xs text-text-secondary flex items-center justify-center gap-2">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => <div key={i} className="w-6 h-6 bg-primary/20 border border-primary rounded-full" />)}
            </div>
            Trusted by 3,000+ early adopters
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="text-accent-positive text-sm font-semibold tracking-[1px] mb-3">THE PROBLEM</div>
          <h2 className="text-5xl font-semibold tracking-tight text-text-primary">Tired of reminders that never come at the right time?</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Calendar, title: "Wrong timing", desc: "You set a reminder to buy milk… but you get it when you’re already home." },
            { icon: Users, title: "Context blind", desc: "You want to call your mom… but you’re in a meeting." },
            { icon: Zap, title: "Energy mismatch", desc: "You plan to exercise… but you’re exhausted." }
          ].map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-foundation border border-border rounded-3xl p-8 group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <item.icon className="text-primary" size={24} />
              </div>
              <div className="font-semibold text-2xl mb-3 text-text-primary">{item.title}</div>
              <p className="text-text-secondary leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-xl text-text-secondary max-w-md mx-auto">Most reminder apps are dumb. They only know time.<br /><span className="text-text-primary font-medium">Remindarin knows context.</span></p>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="bg-foundation py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-accent-positive text-sm font-semibold tracking-[1px] mb-3">3 SIMPLE STEPS</div>
            <h2 className="text-5xl font-semibold tracking-tight text-text-primary">Just tell it what you need.<br />It handles the rest.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {[
              { num: '01', title: 'Capture', desc: 'Say or type anything (“Buy milk when I’m near the supermarket”)', icon: Calendar },
              { num: '02', title: 'Understands Context', desc: 'Remindarin analyzes your calendar, location, energy level, and habits.', icon: MapPin },
              { num: '03', title: 'Reminds You Perfectly', desc: 'You get the reminder at the exact right moment — when you can actually do it.', icon: Zap }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-background border border-border rounded-3xl p-9 flex flex-col"
              >
                <div className="text-[80px] font-semibold text-primary/10 absolute top-6 right-8 tracking-tighter">{step.num}</div>
                <div className="mb-auto">
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-8">
                    <step.icon className="text-text-inverse" size={28} />
                  </div>
                  <div className="text-3xl font-semibold tracking-tight mb-4 text-text-primary">{step.title}</div>
                  <p className="text-text-secondary text-[15px] leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section id="benefits" className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="text-accent-positive text-sm font-semibold tracking-[1px] mb-3">WHY PEOPLE LOVE IT</div>
          <h2 className="text-5xl font-semibold tracking-tight text-text-primary">Why people love Remindarin</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { icon: Clock, title: 'Smart Timing', desc: 'Reminds you when you’re free and nearby' },
            { icon: Zap, title: 'Energy Aware', desc: 'Knows when you’re tired and when you’re focused' },
            { icon: MapPin, title: 'Location Smart', desc: 'Uses your location to trigger reminders' },
            { icon: Users, title: 'Reduces Mental Load', desc: 'You no longer need to remember everything' },
            { icon: Calendar, title: 'Feels Magical', desc: 'After a week, you’ll wonder how you lived without it' }
          ].map((benefit, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex gap-6 bg-foundation border border-border rounded-3xl p-8 items-start group"
            >
              <div className="mt-1 flex-shrink-0 w-11 h-11 bg-accent-positive/10 rounded-2xl flex items-center justify-center group-hover:bg-accent-positive/20 transition-colors">
                <benefit.icon className="text-accent-positive" size={22} />
              </div>
              <div>
                <div className="font-semibold text-xl text-text-primary mb-2">{benefit.title}</div>
                <p className="text-text-secondary">{benefit.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-foundation py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-accent-positive text-sm font-semibold tracking-[1px] mb-3">REAL PEOPLE. REAL RESULTS.</div>
            <h2 className="text-5xl font-semibold tracking-tight text-text-primary">Real people. Real results.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "Remindarin reminded me to call my dad exactly when I was driving home. I’ve never felt this organized.", name: "Sarah K.", role: "Product Designer" },
              { quote: "I used to forget half the things I needed to do. Now Remindarin handles it all. It actually feels like having a personal assistant.", name: "Marcus T.", role: "Software Engineer" },
              { quote: "The best part? It knows I hate grocery shopping on weekdays and only reminds me on weekends.", name: "Priya S.", role: "Marketing Manager" }
            ].map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-background border border-border rounded-3xl p-9 flex flex-col"
              >
                <div className="text-2xl leading-tight text-text-primary mb-auto">“{t.quote}”</div>
                <div className="mt-8 pt-6 border-t border-border flex items-center gap-4">
                  <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">{t.name[0]}</div>
                  <div>
                    <div className="font-semibold text-text-primary">{t.name}</div>
                    <div className="text-sm text-text-secondary">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <div className="text-accent-positive text-sm font-semibold tracking-[1px] mb-4">LAST CHANCE TO GET EARLY ACCESS</div>
        <h2 className="text-6xl font-semibold tracking-tighter text-text-primary mb-6">Ready to never forget the right things again?</h2>
        <p className="text-xl text-text-secondary mb-10 max-w-md mx-auto">Join 3,000+ people already on the waitlist. Be among the first to try Remindarin.</p>
        <Button onClick={() => setWaitlistOpen(true)} className="px-14 text-lg">Join the Waitlist — It’s Free</Button>
        <p className="mt-6 text-xs text-text-secondary">We’ll notify you as soon as Remindarin is available. No spam, ever.</p>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <div className="text-accent-positive text-sm font-semibold tracking-[1px] mb-3">QUESTIONS?</div>
          <h3 className="text-4xl font-semibold tracking-tight text-text-primary">Frequently asked questions</h3>
        </div>
        <div className="space-y-3">
          {[
            { q: "Is Remindarin free?", a: "Yes, the core experience is free during the private beta. Premium features will be introduced later." },
            { q: "Does it work offline?", a: "Core reminders work offline. Advanced context features require an internet connection." },
            { q: "How does it know my location?", a: "We use on-device location services with your explicit permission. Data is never sold." },
            { q: "Is my data private?", a: "Absolutely. All data is encrypted and stored securely. We follow strict privacy-first principles." }
          ].map((faq, i) => (
            <details key={i} className="group bg-foundation border border-border rounded-2xl px-8 py-1">
              <summary className="flex items-center justify-between py-5 cursor-pointer text-lg font-medium text-text-primary list-none">
                {faq.q}
                <span className="text-text-secondary group-open:rotate-180 transition-transform">+</span>
              </summary>
              <div className="pb-6 text-text-secondary pr-8">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>

      <Footer />

      {/* Waitlist BottomSheet */}
      <BottomSheet 
        isOpen={waitlistOpen} 
        onClose={() => { setWaitlistOpen(false); setSubmitted(false); setEmail(''); setName(''); }} 
        title="Join the Waitlist"
      >
        {!submitted ? (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-6">
            <div>
              <p className="text-text-secondary mb-8">Be the first to experience context-aware reminders. We'll send you an invite as soon as we're ready.</p>
            </div>
            <Input 
              label="Full name" 
              placeholder="Alex Rivera" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
            <Input 
              label="Work email" 
              type="email" 
              placeholder="you@company.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <Button type="submit" className="w-full mt-4" disabled={!email}>Reserve my spot</Button>
            <p className="text-center text-xs text-text-secondary">No credit card required • Cancel anytime</p>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-accent-positive/10 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🎉</span>
            </div>
            <div className="text-3xl font-semibold text-text-primary mb-3">You're in!</div>
            <p className="text-text-secondary max-w-xs mx-auto">Welcome to the Remindarin family. Check your inbox soon for your early access link.</p>
            <Button onClick={() => { setWaitlistOpen(false); setSubmitted(false); }} variant="secondary" className="mt-8">Close</Button>
          </div>
        )}
      </BottomSheet>

      {/* Developer Dashboard BottomSheet */}
      <BottomSheet 
        isOpen={devOpen} 
        onClose={() => setDevOpen(false)} 
        title="Developer Dashboard — Preview"
      >
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 bg-accent-positive/10 text-accent-positive text-xs font-medium rounded-full">LIVE PREVIEW</div>
              <div className="text-xs text-text-secondary">Simulated data • Not connected to real backend</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Waitlist Signups', value: '3,247', change: '+18%' },
                { label: 'Reminders Delivered', value: '142,891', change: '+9%' },
                { label: 'Avg. Context Accuracy', value: '94.2%', change: '+2.1%' },
                { label: 'Active Today', value: '1,184', change: '+31%' }
              ].map((stat, idx) => (
                <div key={idx} className="bg-background border border-border rounded-2xl p-5">
                  <div className="text-sm text-text-secondary">{stat.label}</div>
                  <div className="text-4xl font-semibold text-text-primary mt-1 tracking-tighter">{stat.value}</div>
                  <div className="text-xs text-accent-positive mt-1">{stat.change} this week</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-lg">Recent Activity</div>
              <Button variant="ghost" className="text-xs px-4 py-1" onClick={() => {
                setTestNotification(true);
                setTimeout(() => setTestNotification(false), 4200);
              }}>Trigger Test Reminder</Button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { time: '2m ago', text: 'Reminder sent: "Call mom" to Sarah K.' },
                { time: '14m ago', text: 'Location trigger: Grocery list at Whole Foods' },
                { time: '47m ago', text: 'Energy low detected — postponed workout reminder' }
              ].map((act, i) => (
                <div key={i} className="flex justify-between bg-background border border-border rounded-2xl px-5 py-4">
                  <div className="text-text-primary">{act.text}</div>
                  <div className="text-text-secondary text-xs self-center">{act.time}</div>
                </div>
              ))}
            </div>
          </div>

          {testNotification && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-foundation border border-accent-positive shadow-xl rounded-2xl px-6 py-4 flex items-center gap-4 z-[200] max-w-[340px]"
            >
              <div className="text-accent-positive">🔔</div>
              <div className="flex-1">
                <div className="font-medium text-sm">Reminder triggered</div>
                <div className="text-xs text-text-secondary">Buy oat milk — you are 200m from the store</div>
              </div>
              <button onClick={() => setTestNotification(false)} className="text-text-secondary">✕</button>
            </motion.div>
          )}

          <div className="pt-4 border-t border-border text-xs text-center text-text-secondary">
            This is a simulated developer preview. Full dashboard available after launch.
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}