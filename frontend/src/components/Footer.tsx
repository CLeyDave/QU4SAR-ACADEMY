'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  DiscIcon as Discord, Youtube, Twitter, Instagram,
  Mail, MapPin, ChevronRight,
} from 'lucide-react';

const footerLinks = {
  Navegación: [
    { label: 'Inicio', href: '/' },
    { label: 'Horarios', href: '/schedule' },
    { label: 'Academia', href: '/academy' },
    { label: 'Equipo Premier', href: '/team' },
    { label: 'Scrims', href: '/scrims' },
    { label: 'Noticias', href: '/news' },
  ],
  Comunidad: [
    { label: 'Miembros', href: '/members' },
    { label: 'Reclutamiento', href: '/recruitment' },
    { label: 'Media', href: '/media' },
    { label: 'Estadísticas', href: '/stats' },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-[#8B5CF6]/10 bg-[#0A0A0A]">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#8B5CF6]/5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl flex items-center justify-center font-display font-bold text-xl">
                Q
              </div>
              <div>
                <span className="font-display text-xl font-bold gradient-text block">QU4SAR</span>
                <span className="text-xs text-gray-500">VALORANT PREMIER</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
              Organización competitiva de Valorant enfocada en esports de alto nivel,
              academia, scrims y creación de contenido.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Discord, href: '#', color: 'hover:text-[#5865F2]' },
                { icon: Youtube, href: '#', color: 'hover:text-[#FF0000]' },
                { icon: Twitter, href: '#', color: 'hover:text-[#1DA1F2]' },
                { icon: Instagram, href: '#', color: 'hover:text-[#E4405F]' },
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  className={`p-3 rounded-lg glass text-gray-400 ${social.color} transition-all`}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-display text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-[#8B5CF6] text-sm transition-colors flex items-center gap-1 group"
                    >
                      <ChevronRight size={14} className="opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-[#8B5CF6]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 QU4SAR. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 text-gray-500 text-sm">
            <span className="flex items-center gap-1">
              <Mail size={14} /> contacto@quasar.gg
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
