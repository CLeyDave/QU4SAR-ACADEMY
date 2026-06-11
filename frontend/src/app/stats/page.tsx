'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Activity, Award, Target, Users } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import { api } from '@/lib/api';

export default function StatsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await api.stats.getSummary();
      setSummary(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const mainStats = [
    { label: 'Partidas Jugadas', value: summary?.total_matches || 0, icon: Activity, color: 'from-blue-500 to-blue-600' },
    { label: 'Victorias', value: summary?.total_wins || 0, icon: TrendingUp, color: 'from-green-500 to-green-600' },
    { label: 'Derrotas', value: summary?.total_losses || 0, icon: Target, color: 'from-red-500 to-red-600' },
    { label: 'Win Rate', value: (summary?.win_rate || 0) + '%', icon: Award, color: 'from-[#8B5CF6] to-[#7C3AED]' },
    { label: 'MVPs', value: summary?.total_mvps || 0, icon: Users, color: 'from-yellow-500 to-yellow-600' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-[#0A0A0A]">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">
        <AnimatedSection className="text-center mb-16">
          <BarChart3 size={48} className="mx-auto mb-4 text-[#8B5CF6]" />
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Estadísticas</span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Rendimiento general del equipo QU4SAR
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainStats.map((stat, i) => (
            <AnimatedSection key={stat.label} delay={i * 0.1}>
              <div className="glass-card p-8 group">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} className="text-white" />
                </div>
                <div className="font-display text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {(!summary || summary.total_matches === 0) && (
          <div className="text-center py-20">
            <BarChart3 size={64} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-500 text-lg">No hay estadísticas disponibles aún</p>
          </div>
        )}
      </div>
    </div>
  );
}
