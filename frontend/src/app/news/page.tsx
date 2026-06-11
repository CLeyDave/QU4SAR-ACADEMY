'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Calendar, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import AnimatedSection from '@/components/AnimatedSection';
import { api } from '@/lib/api';
import type { NewsPost } from '@/types';

export default function NewsPage() {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  async function loadNews() {
    try {
      const data = await api.news.getPublished();
      setNews(data);
    } catch (err) {
      console.error('Error loading news:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-[#0A0A0A]">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">
        <AnimatedSection className="text-center mb-16">
          <Newspaper size={48} className="mx-auto mb-4 text-[#8B5CF6]" />
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Noticias</span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Últimas actualizaciones, anuncios y novedades de QU4SAR
          </p>
        </AnimatedSection>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper size={64} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-500 text-lg">No hay noticias publicadas aún</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item, i) => (
              <AnimatedSection key={item.id} delay={i * 0.1}>
                <article className="glass-card overflow-hidden group h-full flex flex-col">
                  {item.image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {item.author}
                      </span>
                    </div>
                    <h2 className="font-display text-lg font-bold text-white mb-2 group-hover:text-[#8B5CF6] transition-colors line-clamp-2">
                      {item.title}
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed flex-1 line-clamp-3">
                      {item.excerpt || item.content}
                    </p>
                  </div>
                </article>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
