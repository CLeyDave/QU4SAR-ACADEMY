'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Target, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import AnimatedSection from '@/components/AnimatedSection';
import { api } from '@/lib/api';

const weeklyTopics = [
  { day: 'Lunes', topic: 'Fundamentos de Aim y Mecánicas', objectives: ['Crosshair placement', 'Spray control', 'Movimiento básico'] },
  { day: 'Martes', topic: 'Tácticas y Estrategias', objectives: ['Lectura de mapa', 'Rotaciones', 'Economía'] },
  { day: 'Miércoles', topic: 'Trabajo en Equipo', objectives: ['Comunicación', 'Coordinar utilities', 'Plays en equipo'] },
  { day: 'Jueves', topic: 'Análisis de Partidas', objectives: ['VOD review', 'Errores comunes', 'Mejora continua'] },
  { day: 'Viernes', topic: 'Scrims Oficiales', objectives: ['Práctica competitiva', 'Ejecución de tácticas', 'Evaluación'] },
];

const studyMaterials = [
  { title: 'Guía de Aim Training', desc: 'Rutinas diarias para mejorar tu precisión', icon: Target },
  { title: 'Mapas y Callouts', desc: 'Guía completa de todos los mapas de Valorant', icon: BookOpen },
  { title: 'Economía Round por Round', desc: 'Aprende a manejar la economía del equipo', icon: GraduationCap },
  { title: 'VOD Review Semanal', desc: 'Análisis de partidas profesionales', icon: Clock },
];

export default function AcademyPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-[#0A0A0A]">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">
        <AnimatedSection className="text-center mb-16">
          <GraduationCap size={48} className="mx-auto mb-4 text-[#8B5CF6]" />
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Academia QU4SAR</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Programa de entrenamiento estructurado diseñado para llevar tus habilidades al siguiente nivel.
            Clases diarias con coaches profesionales.
          </p>
        </AnimatedSection>

        {/* Weekly Schedule */}
        <AnimatedSection delay={0.1} className="mb-16">
          <h2 className="font-display text-2xl font-bold mb-8 flex items-center gap-3">
            <Clock size={24} className="text-[#8B5CF6]" />
            Programación Semanal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {weeklyTopics.map((item, i) => (
              <AnimatedSection key={item.day} delay={i * 0.1}>
                <div className="glass-card p-6 h-full">
                  <div className="text-[#8B5CF6] font-display text-sm font-bold mb-2">{item.day}</div>
                  <h3 className="font-display text-base font-bold text-white mb-3">{item.topic}</h3>
                  <ul className="space-y-2">
                    {item.objectives.map((obj) => (
                      <li key={obj} className="flex items-start gap-2 text-gray-400 text-sm">
                        <CheckCircle size={14} className="text-[#8B5CF6] mt-0.5 shrink-0" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>

        {/* Study Materials */}
        <AnimatedSection delay={0.2}>
          <h2 className="font-display text-2xl font-bold mb-8 flex items-center gap-3">
            <BookOpen size={24} className="text-[#8B5CF6]" />
            Material de Estudio
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {studyMaterials.map((material, i) => (
              <AnimatedSection key={material.title} delay={i * 0.1}>
                <div className="glass-card p-6 group cursor-pointer">
                  <material.icon size={32} className="text-[#8B5CF6] mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-white mb-2">{material.title}</h3>
                  <p className="text-gray-400 text-sm">{material.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection delay={0.3} className="mt-16 text-center">
          <Link href="/recruitment" className="btn-primary text-lg px-10 py-4">
            Únete a la Academia <ArrowRight size={20} />
          </Link>
        </AnimatedSection>
      </div>
    </div>
  );
}
