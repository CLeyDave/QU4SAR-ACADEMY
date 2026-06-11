'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Home, Calendar, GraduationCap, Trophy, Swords,
  BarChart3, Film, Newspaper, Users, UserPlus, Shield,
} from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';

const navLinks = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/schedule', label: 'Horarios', icon: Calendar },
  { href: '/academy', label: 'Academia', icon: GraduationCap },
  { href: '/team', label: 'Equipo Premier', icon: Trophy },
  { href: '/scrims', label: 'Scrims', icon: Swords },
  { href: '/stats', label: 'Estadísticas', icon: BarChart3 },
  { href: '/media', label: 'Media', icon: Film },
  { href: '/news', label: 'Noticias', icon: Newspaper },
  { href: '/members', label: 'Miembros', icon: Users },
  { href: '/recruitment', label: 'Reclutamiento', icon: UserPlus },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (isAdmin) return null;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#8B5CF6]/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-lg flex items-center justify-center font-display font-bold text-lg group-hover:shadow-lg group-hover:shadow-[#8B5CF6]/25 transition-all">
              Q
            </div>
            <span className="font-display text-xl font-bold gradient-text hidden sm:block">
              QU4SAR
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'text-[#8B5CF6] bg-[#8B5CF6]/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated() && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#8B5CF6] text-sm font-medium hover:bg-[#8B5CF6]/20 transition-all"
              >
                <Shield size={16} />
                Admin
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-[#8B5CF6]/10 bg-[#0A0A0A]/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    pathname === link.href
                      ? 'text-[#8B5CF6] bg-[#8B5CF6]/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <link.icon size={18} />
                  {link.label}
                </Link>
              ))}
              {isAuthenticated() && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#8B5CF6] bg-[#8B5CF6]/10"
                >
                  <Shield size={18} />
                  Panel Admin
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
