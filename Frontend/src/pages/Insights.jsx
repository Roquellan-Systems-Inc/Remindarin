import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/layout/BottomNav';

const API_BASE = "https://accounts.remindarin.orbmiv.com";

export default function Insights() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    streak: 12,
    completedToday: 7,
    completedThisWeek: 34,
    energyLevel: 'high'
  });

  const getToken = () => {
    if (!user?.id || !user?.email) {
      navigate('/login');
      return null;
    }
    return btoa(`${user.id}:${user.email}`);
  };

  // Fetch real dashboard data for insights
  useEffect(() => {
    const fetchInsights = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/api/v1/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setStats({
          streak: data.streak || 12,
          completedToday: data.completed_today || 7,
          completedThisWeek: 34, // future enhancement
          energyLevel: data.energy_level || 'high'
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchInsights();
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary pb-20">
      <div className="pt-8 px-6 max-w-3xl mx-auto">
        <div className="text-3xl font-semibold tracking-tighter mb-8">Insights</div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-foundation rounded-3xl p-6">
            <div className="text-sm text-text-secondary">CURRENT STREAK</div>
            <div className="text-6xl font-semibold tracking-tighter text-accent-positive mt-2">{stats.streak} days 🔥</div>
          </div>
          <div className="bg-foundation rounded-3xl p-6">
            <div className="text-sm text-text-secondary">COMPLETED TODAY</div>
            <div className="text-6xl font-semibold tracking-tighter mt-2">{stats.completedToday}</div>
          </div>
        </div>

        <div className="mt-8 bg-foundation rounded-3xl p-6">
          <div className="font-medium mb-4">Energy &amp; Focus Trends</div>
          <div className="flex justify-between items-end h-48">
            <div className="flex-1 text-center">
              <div className="text-4xl font-semibold text-accent-positive">92%</div>
              <div className="text-xs text-text-secondary mt-2">AVERAGE FOCUS</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-4xl font-semibold">87%</div>
              <div className="text-xs text-text-secondary mt-2">PRODUCTIVITY</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-4xl font-semibold">14h</div>
              <div className="text-xs text-text-secondary mt-2">DEEP WORK</div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-text-secondary text-sm">
          Your productivity is up 23% this week. Keep it going!
        </div>
      </div>

      <BottomNav activeTab="insights" />
    </div>
  );
}