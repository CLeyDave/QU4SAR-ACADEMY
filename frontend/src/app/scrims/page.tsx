'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swords, Trophy, XCircle, MinusCircle, Calendar, User } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import { api } from '@/lib/api';
import type { Scrim } from '@/types';

const resultStyles: Record<string, string> = {
  Victoria: 'bg-green-500/20 text-green-400 border-green-500/30',
  Derrota: 'bg-red-500/20 text-red-400 border-red-500/30',
  Empate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Pendiente: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function ScrimsPage() {
  const [scrims, setScrims] = useState<Scrim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScrims();
  }, []);

  async function loadScrims() {
    try {
      const data = await api.scrims.getAll();
      setScrims(data);
    } catch (err) {
      console.error('Error loading scrims:', err);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    total: scrims.length,
    wins: scrims.filter((s) => s.result === 'Victoria').length,
    losses: scrims.filter((s) => s.result === 'Derrota').length,
    draws: scrims.filter((s) => s.result === 'Empate').length,
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-[#0A0A0A]">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">
        <AnimatedSection className="text-center mb-12">
          <Swords size={48} className="mx-auto mb-4 text-[#8B5CF6]" />
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Scrims</span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Historial de partidas de práctica y resultados
          </p>
        </AnimatedSection>

        {/* Stats cards */}
        {scrims.length > 0 && (
          <AnimatedSection delay={0.1} className="mb-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total', value: stats.total, icon: Swords, color: 'text-[#8B5CF6]' },
                { label: 'Victorias', value: stats.wins, icon: Trophy, color: 'text-green-400' },
                { label: 'Derrotas', value: stats.losses, icon: XCircle, color: 'text-red-400' },
                { label: 'Win Rate', value: stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) + '%' : '0%', icon: Trophy, color: 'text-[#8B5CF6]' },
              ].map((stat, i) => (
                <div key={stat.label} className="glass-card p-4 text-center">
                  <stat.icon size={20} className={`mx-auto mb-2 ${stat.color}`} />
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-gray-500 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        )}

        {/* Scrim list */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : scrims.length === 0 ? (
          <div className="text-center py-20">
            <Swords size={64} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-500 text-lg">No hay scrims registrados aún</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scrims.map((scrim, i) => (
              <AnimatedSection key={scrim.id} delay={i * 0.03}>
                <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${resultStyles[scrim.result]}`}>
                      {scrim.result === 'Victoria' ? 'W' : scrim.result === 'Derrota' ? 'L' : 'D'}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">vs {scrim.opponent}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><Calendar size={12} />{new Date(scrim.date).toLocaleDateString()}</span>
                        <span>{scrim.our_score} - {scrim.opponent_score}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm px-3 py-1 rounded-full border ${resultStyles[scrim.result]}`}>
                      {scrim.result}
                    </span>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
