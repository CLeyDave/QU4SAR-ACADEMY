'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Shield, Star, Medal, User } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import { api } from '@/lib/api';
import type { TeamMember } from '@/types';

const statusColors: Record<string, string> = {
  Titular: 'bg-green-500/20 text-green-400 border-green-500/30',
  Suplente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Prueba: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const roleIcons: Record<string, any> = {
  Duelist: Star,
  Initiator: Medal,
  Controller: Shield,
  Sentinel: Shield,
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    try {
      const data = await api.team.getAll();
      setMembers(data);
    } catch (err) {
      console.error('Error loading team:', err);
    } finally {
      setLoading(false);
    }
  }

  const grouped = {
    Titular: members.filter((m) => m.status === 'Titular'),
    Suplente: members.filter((m) => m.status === 'Suplente'),
    Prueba: members.filter((m) => m.status === 'Prueba'),
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-[#0A0A0A]">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">
        <AnimatedSection className="text-center mb-16">
          <Trophy size={48} className="mx-auto mb-4 text-[#8B5CF6]" />
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Equipo Premier</span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Conoce a los jugadores que representan a QU4SAR en Valorant Premier
          </p>
        </AnimatedSection>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-20">
            <User size={64} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-500 text-lg">No hay jugadores registrados aún</p>
          </div>
        ) : (
          <>
            {Object.entries(grouped).map(([status, teamMembers]) =>
              teamMembers.length > 0 && (
                <div key={status} className="mb-12">
                  <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-3">
                    {status === 'Titular' && <Star size={20} className="text-green-400" />}
                    {status === 'Suplente' && <Medal size={20} className="text-yellow-400" />}
                    {status === 'Prueba' && <User size={20} className="text-blue-400" />}
                    <span>{status}</span>
                    <span className="text-sm text-gray-500 font-normal">({teamMembers.length})</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {teamMembers.map((member, i) => {
                      const RoleIcon = roleIcons[member.role] || User;
                      return (
                        <AnimatedSection key={member.id} delay={i * 0.05}>
                          <div className="glass-card p-6 text-center group">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8B5CF6]/20 to-[#7C3AED]/20 mx-auto mb-4 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-[#8B5CF6]/20 transition-all">
                              {member.image_url ? (
                                <img
                                  src={member.image_url}
                                  alt={member.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <User size={36} className="text-[#8B5CF6]" />
                              )}
                            </div>
                            <h3 className="font-display text-lg font-bold text-white mb-1">{member.name}</h3>
                            <div className="flex items-center justify-center gap-2 mb-3">
                              <RoleIcon size={14} className="text-[#8B5CF6]" />
                              <span className="text-gray-400 text-sm">{member.role}</span>
                            </div>
                            {member.rank && (
                              <span className="text-xs text-gray-500 block mb-3">{member.rank}</span>
                            )}
                            <span className={`text-xs px-3 py-1 rounded-full border ${statusColors[member.status] || statusColors.Titular}`}>
                              {member.status}
                            </span>
                            {member.bio && (
                              <p className="text-gray-500 text-xs mt-3 line-clamp-2">{member.bio}</p>
                            )}
                          </div>
                        </AnimatedSection>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
