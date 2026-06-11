'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, BookOpen, Swords, Trophy, Target } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import { api } from '@/lib/api';
import type { ScheduleEvent } from '@/types';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const typeIcons: Record<string, any> = {
  academia: BookOpen,
  entrenamiento: Target,
  scrim: Swords,
  premier: Trophy,
  default: Calendar,
};

const typeColors: Record<string, string> = {
  academia: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  entrenamiento: 'bg-green-500/20 text-green-400 border-green-500/30',
  scrim: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  premier: 'bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30',
};

export default function SchedulePage() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const data = await api.schedule.getAll();
      setEvents(data);
    } catch (err) {
      console.error('Error loading schedule:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredEvents = selectedDay !== null
    ? events.filter((e) => e.day_of_week === selectedDay)
    : events;

  const groupedByDay = DAYS.map((day, index) => ({
    day,
    index,
    events: events.filter((e) => e.day_of_week === index),
  }));

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-[#0A0A0A]">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">
        <AnimatedSection className="text-center mb-12">
          <Calendar size={48} className="mx-auto mb-4 text-[#8B5CF6]" />
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Horarios</span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Calendario semanal de actividades, entrenamientos y competiciones
          </p>
        </AnimatedSection>

        {/* Day selector */}
        <AnimatedSection delay={0.1} className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedDay(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedDay === null
                  ? 'bg-[#8B5CF6] text-white'
                  : 'glass text-gray-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            {DAYS.map((day, i) => (
              <button
                key={day}
                onClick={() => setSelectedDay(i)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedDay === i
                    ? 'bg-[#8B5CF6] text-white'
                    : 'glass text-gray-400 hover:text-white'
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {groupedByDay.map(({ day, index, events: dayEvents }, dayIdx) => (
              <AnimatedSection key={day} delay={dayIdx * 0.05}>
                <div
                  className={`glass-card p-4 ${
                    selectedDay === index ? 'ring-2 ring-[#8B5CF6]' : ''
                  }`}
                >
                  <h3 className="font-display text-sm font-bold text-center mb-4 pb-3 border-b border-[#8B5CF6]/10">
                    <span className={selectedDay === index ? 'text-[#8B5CF6]' : 'text-gray-300'}>
                      {day.slice(0, 3)}
                    </span>
                  </h3>
                  {dayEvents.length === 0 ? (
                    <p className="text-gray-600 text-xs text-center py-4">Sin actividades</p>
                  ) : (
                    <div className="space-y-3">
                      {dayEvents.map((event) => {
                        const Icon = typeIcons[event.type] || typeIcons.default;
                        const colorClass = typeColors[event.type] || 'glass';
                        return (
                          <div
                            key={event.id}
                            className="glass p-3 rounded-lg group hover:bg-[#8B5CF6]/5 transition-all cursor-default"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Icon size={14} className="text-[#8B5CF6]" />
                              <span className="text-xs font-medium text-white truncate">
                                {event.title}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock size={12} />
                                {event.start_time} - {event.end_time}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${colorClass}`}>
                                {event.type}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
