'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Send, CheckCircle, User, Gamepad2, BarChart3, Target, Clock } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import { api } from '@/lib/api';

const roles = ['Duelist', 'Initiator', 'Controller', 'Sentinel', 'Flex'];
const ranks = ['Hierro', 'Bronce', 'Plata', 'Oro', 'Platino', 'Diamante', 'Ascendente', 'Inmortal', 'Radiante'];

export default function RecruitmentPage() {
  const [formData, setFormData] = useState({
    name: '',
    riot_id: '',
    rank: '',
    primary_role: '',
    availability: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.recruitment.create(formData);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <CheckCircle size={80} className="mx-auto mb-6 text-green-400" />
          </motion.div>
          <h1 className="font-display text-3xl font-bold mb-4 gradient-text">¡Solicitud Enviada!</h1>
          <p className="text-gray-400 mb-8">
            Gracias por aplicar a QU4SAR. Revisaremos tu solicitud y te contactaremos pronto.
          </p>
          <button onClick={() => { setSubmitted(false); setFormData({ name: '', riot_id: '', rank: '', primary_role: '', availability: '' }); }} className="btn-primary">
            Nueva Solicitud
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-[#0A0A0A]">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="max-w-4xl mx-auto relative">
        <AnimatedSection className="text-center mb-12">
          <UserPlus size={48} className="mx-auto mb-4 text-[#8B5CF6]" />
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Reclutamiento</span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            ¿Quieres ser parte de QU4SAR? Completa el formulario y únete a nuestra organización
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="glass-card p-8 md:p-12 max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <User size={16} className="text-[#8B5CF6]" /> Nombre
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="input-field"
                  placeholder="Tu nombre o alias"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Gamepad2 size={16} className="text-[#8B5CF6]" /> Riot ID
                </label>
                <input
                  type="text"
                  required
                  value={formData.riot_id}
                  onChange={(e) => updateField('riot_id', e.target.value)}
                  className="input-field"
                  placeholder="Nombre#TAG"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <BarChart3 size={16} className="text-[#8B5CF6]" /> Rango
                </label>
                <select
                  value={formData.rank}
                  onChange={(e) => updateField('rank', e.target.value)}
                  className="input-field"
                >
                  <option value="">Selecciona tu rango</option>
                  {ranks.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Target size={16} className="text-[#8B5CF6]" /> Rol Principal
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {roles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => updateField('primary_role', role)}
                      className={`p-3 rounded-lg text-sm font-medium border transition-all ${
                        formData.primary_role === role
                          ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white'
                          : 'glass border-transparent text-gray-400 hover:text-white'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Clock size={16} className="text-[#8B5CF6]" /> Horarios Disponibles
                </label>
                <textarea
                  value={formData.availability}
                  onChange={(e) => updateField('availability', e.target.value)}
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Describe tus horarios disponibles para entrenar y jugar..."
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center text-base py-4 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send size={18} /> Enviar Solicitud
                  </span>
                )}
              </button>
            </form>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
