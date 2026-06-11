'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, ChevronDown, Trophy, Swords, GraduationCap,
  Users, BarChart3, Shield, DiscIcon as Discord,
} from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';

const stats = [
  { label: 'Jugadores', value: '12', icon: Users },
  { label: 'Partidas', value: '150+', icon: Swords },
  { label: 'Victorias', value: '98', icon: Trophy },
  { label: 'Win Rate', value: '65%', icon: BarChart3 },
];

const features = [
  {
    icon: Trophy,
    title: 'Equipo Premier',
    desc: 'Compitiendo al más alto nivel en Valorant Premier con roster competitivo.',
    href: '/team',
  },
  {
    icon: GraduationCap,
    title: 'Academia',
    desc: 'Programa de entrenamiento estructurado para mejorar tus habilidades.',
    href: '/academy',
  },
  {
    icon: Swords,
    title: 'Scrims',
    desc: 'Partidas de práctica organizadas contra equipos de alto nivel.',
    href: '/scrims',
  },
  {
    icon: Shield,
    title: 'Comunidad',
    desc: 'Únete a nuestra comunidad y sé parte de QU4SAR.',
    href: '/members',
  },
];

export default function HomePage() {
  return (
    <div className="bg-[#0A0A0A]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#7C3AED]/10 rounded-full blur-[100px] animate-pulse-slow" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-8"
          >
            <div className="inline-flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] shadow-2xl shadow-[#8B5CF6]/25 mb-8">
              <span className="font-display font-black text-5xl sm:text-6xl text-white">Q</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-5xl sm:text-7xl lg:text-8xl font-black mb-6"
          >
            <span className="gradient-text">QU4SAR</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl text-gray-400 mb-4 max-w-2xl mx-auto"
          >
            Organización competitiva de Valorant Premier
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-base sm:text-lg text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed"
          >
            Academia, scrims, creación de contenido y esports de alto nivel.
            Forjando campeones desde las sombras del cosmos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/recruitment" className="btn-primary text-base px-8 py-4">
              <UserPlusIcon /> Reclutamiento
            </Link>
            <a
              href="#"
              className="btn-secondary text-base px-8 py-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Discord size={20} />
              Discord
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <ChevronDown size={32} className="text-[#8B5CF6] animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, i) => (
              <AnimatedSection key={stat.label} delay={i * 0.1}>
                <div className="glass-card p-6 md:p-8 text-center group">
                  <stat.icon size={32} className="mx-auto mb-4 text-[#8B5CF6] group-hover:scale-110 transition-transform" />
                  <div className="font-display text-3xl md:text-4xl font-bold gradient-text mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Nuestro <span className="gradient-text">Ecosistema</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Todo lo que necesitas para llevar tu juego al siguiente nivel
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <AnimatedSection key={feature.title} delay={i * 0.1}>
                <Link href={feature.href}>
                  <div className="glass-card p-8 h-full group cursor-pointer">
                    <feature.icon
                      size={40}
                      className="text-[#8B5CF6] mb-6 group-hover:scale-110 transition-transform"
                    />
                    <h3 className="font-display text-lg font-bold mb-3 group-hover:text-[#8B5CF6] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <div className="glass-card p-12 md:p-16 neon-border">
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
                ¿Listo para ser parte de <span className="gradient-text">QU4SAR</span>?
              </h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Únete a nuestra comunidad y compite al más alto nivel en Valorant Premier
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/recruitment" className="btn-primary text-lg px-10 py-4">
                  Aplicar Ahora <ArrowRight size={20} />
                </Link>
                <a
                  href="#"
                  className="btn-secondary text-lg px-10 py-4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Discord size={20} /> Discord
                </a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}
