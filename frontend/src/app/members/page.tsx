'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Shield, User, Gamepad2 } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import { api } from '@/lib/api';
import type { Member } from '@/types';

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    try {
      const data = await api.members.getAll();
      setMembers(data);
    } catch (err) {
      console.error('Error loading members:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase()) ||
    (m.rank && m.rank.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-[#0A0A0A]">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">
        <AnimatedSection className="text-center mb-12">
          <Users size={48} className="mx-auto mb-4 text-[#8B5CF6]" />
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Miembros</span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Todos los integrantes de la comunidad QU4SAR
          </p>
        </AnimatedSection>

        {/* Search */}
        <AnimatedSection delay={0.1} className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar miembros..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-12"
            />
          </div>
        </AnimatedSection>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Users size={64} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-500 text-lg">
              {members.length === 0 ? 'No hay miembros registrados aún' : 'No se encontraron miembros'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((member, i) => (
              <AnimatedSection key={member.id} delay={i * 0.05}>
                <div className="glass-card p-6 text-center group">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8B5CF6]/20 to-[#7C3AED]/20 mx-auto mb-4 flex items-center justify-center">
                    {member.image_url ? (
                      <img src={member.image_url} alt={member.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User size={36} className="text-[#8B5CF6]" />
                    )}
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-1">{member.name}</h3>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Shield size={14} className="text-[#8B5CF6]" />
                    <span className="text-gray-400 text-sm">{member.role}</span>
                  </div>
                  {member.rank && (
                    <span className="text-xs text-gray-500 block mb-2">{member.rank}</span>
                  )}
                  {member.discord_id && (
                    <span className="text-xs text-gray-600 flex items-center justify-center gap-1">
                      <Gamepad2 size={12} /> {member.discord_id}
                    </span>
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
