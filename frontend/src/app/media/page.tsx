'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Film, Youtube, Music2, Play, ExternalLink } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import { api } from '@/lib/api';
import type { MediaItem } from '@/types';

const typeIcons: Record<string, any> = {
  youtube: Youtube,
  tiktok: Music2,
  clip: Play,
};

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia() {
    try {
      const data = await api.media.getAll();
      setMedia(data);
    } catch (err) {
      console.error('Error loading media:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === 'all' ? media : media.filter((m) => m.type === filter);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-[#0A0A0A]">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">
        <AnimatedSection className="text-center mb-12">
          <Film size={48} className="mx-auto mb-4 text-[#8B5CF6]" />
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Media</span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Videos, clips y contenido destacado de QU4SAR
          </p>
        </AnimatedSection>

        {/* Filter */}
        <AnimatedSection delay={0.1} className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { key: 'all', label: 'Todo' },
              { key: 'youtube', label: 'YouTube' },
              { key: 'tiktok', label: 'TikTok' },
              { key: 'clip', label: 'Clips' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f.key
                    ? 'bg-[#8B5CF6] text-white'
                    : 'glass text-gray-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Film size={64} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-500 text-lg">No hay contenido multimedia aún</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((item, i) => {
              const Icon = typeIcons[item.type] || Play;
              return (
                <AnimatedSection key={item.id} delay={i * 0.05}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card overflow-hidden group block"
                  >
                    <div className="aspect-video bg-gradient-to-br from-[#8B5CF6]/10 to-[#7C3AED]/10 relative flex items-center justify-center">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <Icon size={48} className="text-[#8B5CF6] group-hover:scale-110 transition-transform" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play size={48} className="text-white" />
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={14} className="text-[#8B5CF6]" />
                        <span className="text-xs text-gray-500 uppercase">{item.type}</span>
                      </div>
                      <h3 className="font-bold text-sm text-white line-clamp-2 group-hover:text-[#8B5CF6] transition-colors">
                        {item.title}
                      </h3>
                    </div>
                  </a>
                </AnimatedSection>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
