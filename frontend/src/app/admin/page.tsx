'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, LogOut, Key, Save, Plus, Trash2, Edit3, X,
  LayoutDashboard, Newspaper, Calendar, Users, Trophy,
  Swords, BarChart3, Film, UserPlus, Image, Menu,
  ChevronDown, ChevronUp, RefreshCw, Eye, EyeOff,
} from 'lucide-react';
import { api } from '@/lib/api';
import { getToken, setToken, setUser, removeToken, getUser, isAuthenticated } from '@/lib/auth';
import type {
  NewsPost, ScheduleEvent, TeamMember, Scrim,
  RecruitmentRequest, Member, MediaItem, Stats,
} from '@/types';

type Tab =
  | 'dashboard' | 'content' | 'news' | 'schedule' | 'team'
  | 'scrims' | 'recruitment' | 'members' | 'media' | 'stats' | 'password';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUserData] = useState<{ username: string; role: string } | null>(null);

  // Data states
  const [news, setNews] = useState<NewsPost[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [scrims, setScrims] = useState<Scrim[]>([]);
  const [recruitment, setRecruitment] = useState<RecruitmentRequest[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);
  const [content, setContent] = useState<Record<string, string>>({});

  // Notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      setAuthenticated(true);
      setUserData(getUser());
      loadAllData();
    } else {
      setLoading(false);
    }
  }, []);

  function notify(type: 'success' | 'error', message: string) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }

  async function loadAllData() {
    try {
      const token = getToken()!;
      const [newsData, scheduleData, teamData, scrimsData, recData, membersData, mediaData, statsData, homeContent] = await Promise.all([
        api.news.getAll(),
        api.schedule.getAll(),
        api.team.getAll(),
        api.scrims.getAll(),
        api.recruitment.getAll(token),
        api.members.getAll(),
        api.media.getAll(),
        api.stats.getAll(),
        api.content.get('home'),
      ]);
      setNews(newsData);
      setSchedule(scheduleData);
      setTeam(teamData);
      setScrims(scrimsData);
      setRecruitment(recData);
      setMembers(membersData);
      setMedia(mediaData);
      setStats(statsData);
      setContent(homeContent);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    try {
      const data = await api.auth.login(loginForm.username, loginForm.password);
      setToken(data.token);
      setUser({ username: data.username, role: data.role });
      setUserData({ username: data.username, role: data.role });
      setAuthenticated(true);
      loadAllData();
    } catch (err: any) {
      setLoginError(err.message || 'Credenciales inválidas');
    }
  }

  function handleLogout() {
    removeToken();
    setAuthenticated(false);
    setUserData(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="glass-card p-8 md:p-12 w-full max-w-md">
          <div className="text-center mb-8">
            <Shield size={48} className="mx-auto mb-4 text-[#8B5CF6]" />
            <h1 className="font-display text-2xl font-bold gradient-text">Panel Admin</h1>
            <p className="text-gray-500 text-sm mt-2">Acceso restringido</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Usuario"
              value={loginForm.username}
              onChange={(e) => setLoginForm((p) => ({ ...p, username: e.target.value }))}
              className="input-field"
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={loginForm.password}
              onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
              className="input-field"
              required
            />
            {loginError && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{loginError}</p>}
            <button type="submit" className="btn-primary w-full justify-center text-base py-3">
              <Shield size={18} /> Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'content', label: 'Contenido Web', icon: Menu },
    { key: 'news', label: 'Noticias', icon: Newspaper, count: news.length },
    { key: 'schedule', label: 'Horarios', icon: Calendar, count: schedule.length },
    { key: 'team', label: 'Equipo', icon: Trophy, count: team.length },
    { key: 'scrims', label: 'Scrims', icon: Swords, count: scrims.length },
    { key: 'recruitment', label: 'Solicitudes', icon: UserPlus, count: recruitment.filter((r) => r.status === 'Pendiente').length },
    { key: 'members', label: 'Miembros', icon: Users, count: members.length },
    { key: 'media', label: 'Media', icon: Film, count: media.length },
    { key: 'stats', label: 'Estadísticas', icon: BarChart3, count: stats.length },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0A0A0A] border-r border-[#8B5CF6]/10 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 overflow-y-auto`}>
        <div className="p-4 border-b border-[#8B5CF6]/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-lg flex items-center justify-center font-display font-bold">Q</div>
            <div>
              <div className="font-display text-sm font-bold gradient-text">QU4SAR Admin</div>
              <div className="text-xs text-gray-500">{user?.username}</div>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={18} />
              <span className="flex-1 text-left">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6]">{tab.count}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-[#8B5CF6]/10 mt-4">
          <button
            onClick={() => setActiveTab('password')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all mb-1"
          >
            <Key size={18} /> Cambiar Contraseña
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#8B5CF6]/10 px-4 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
                <Menu size={20} />
              </button>
              <h2 className="font-display text-lg font-bold gradient-text">{tabs.find((t) => t.key === activeTab)?.label}</h2>
            </div>
            <button onClick={loadAllData} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all" title="Recargar datos">
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-sm font-medium ${
                notification.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="p-4 lg:p-8">
          {activeTab === 'dashboard' && <DashboardTab data={{ news, schedule, team, scrims, recruitment, members, media, stats }} />}
          {activeTab === 'content' && <ContentTab content={content} setContent={setContent} notify={notify} loadAll={loadAllData} />}
          {activeTab === 'news' && <NewsTab items={news} setItems={setNews} notify={notify} />}
          {activeTab === 'schedule' && <ScheduleTab items={schedule} setItems={setSchedule} notify={notify} />}
          {activeTab === 'team' && <TeamTab items={team} setItems={setTeam} notify={notify} />}
          {activeTab === 'scrims' && <ScrimsTab items={scrims} setItems={setScrims} notify={notify} />}
          {activeTab === 'recruitment' && <RecruitmentTab items={recruitment} setItems={setRecruitment} notify={notify} />}
          {activeTab === 'members' && <MembersTab items={members} setItems={setMembers} notify={notify} />}
          {activeTab === 'media' && <MediaTab items={media} setItems={setMedia} notify={notify} />}
          {activeTab === 'stats' && <StatsTab items={stats} setItems={setStats} notify={notify} />}
          {activeTab === 'password' && <PasswordTab notify={notify} />}
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ──────────────────────────────────────────────
function DashboardTab({ data }: { data: any }) {
  const cards = [
    { label: 'Noticias', value: data.news.length, icon: Newspaper, color: 'from-blue-500 to-blue-600' },
    { label: 'Horarios', value: data.schedule.length, icon: Calendar, color: 'from-green-500 to-green-600' },
    { label: 'Jugadores', value: data.team.length, icon: Trophy, color: 'from-[#8B5CF6] to-[#7C3AED]' },
    { label: 'Scrims', value: data.scrims.length, icon: Swords, color: 'from-orange-500 to-orange-600' },
    { label: 'Solicitudes Pendientes', value: data.recruitment.filter((r: any) => r.status === 'Pendiente').length, icon: UserPlus, color: 'from-yellow-500 to-yellow-600' },
    { label: 'Miembros', value: data.members.length, icon: Users, color: 'from-teal-500 to-teal-600' },
    { label: 'Media', value: data.media.length, icon: Film, color: 'from-pink-500 to-pink-600' },
    { label: 'Stats', value: data.stats.length, icon: BarChart3, color: 'from-indigo-500 to-indigo-600' },
  ];

  const scrimWins = data.scrims.filter((s: any) => s.result === 'Victoria').length;
  const scrimTotal = data.scrims.length;
  const winRate = scrimTotal > 0 ? Math.round((scrimWins / scrimTotal) * 100) : 0;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
              <card.icon size={18} className="text-white" />
            </div>
            <div className="font-display text-2xl font-bold gradient-text">{card.value}</div>
            <div className="text-gray-500 text-xs mt-1">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {scrimTotal > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-display text-lg font-bold mb-4">Resumen de Scrims</h3>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-green-400">{scrimWins}</div>
              <div className="text-gray-500 text-xs">Victorias</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-red-400">{scrimTotal - scrimWins}</div>
              <div className="text-gray-500 text-xs">Derrotas</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-[#8B5CF6]">{winRate}%</div>
              <div className="text-gray-500 text-xs">Win Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CONTENT TAB ────────────────────────────────────────────
function ContentTab({ content, setContent, notify, loadAll }: any) {
  const [localContent, setLocalContent] = useState(content);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setLocalContent(content); }, [content]);

  const fields = [
    { key: 'hero_title', label: 'Título del Hero' },
    { key: 'hero_subtitle', label: 'Subtítulo del Hero' },
    { key: 'hero_description', label: 'Descripción del Hero' },
    { key: 'about_title', label: 'Título "Sobre Nosotros"' },
    { key: 'about_text', label: 'Texto "Sobre Nosotros"' },
    { key: 'discord_link', label: 'Link de Discord' },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.content.update('home', localContent, getToken()!);
      notify('success', 'Contenido actualizado');
      setContent(localContent);
    } catch (err: any) {
      notify('error', err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <p className="text-gray-500 text-sm mb-6">Edita el contenido textual del sitio web sin tocar código.</p>
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-400 mb-1">{field.label}</label>
            <input
              value={localContent[field.key] || ''}
              onChange={(e) => setLocalContent((p: any) => ({ ...p, [field.key]: e.target.value }))}
              className="input-field"
            />
          </div>
        ))}
      </div>
      <button onClick={handleSave} disabled={saving} className="btn-primary mt-6">
        <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </div>
  );
}

// ─── GENERIC CRUD TABLE ─────────────────────────────────────
function CrudTable({ items, columns, onAdd, onEdit, onDelete, emptyMessage = 'No hay datos' }: any) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  return (
    <div>
      <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary mb-6 text-sm">
        <Plus size={16} /> Agregar Nuevo
      </button>

      {showForm && onAdd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="glass-card p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold">{editing ? 'Editar' : 'Agregar'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            {onAdd(editing, () => { setShowForm(false); setEditing(null); })}
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#8B5CF6]/10">
                {columns.map((col: string) => (
                  <th key={col} className="text-left text-xs text-gray-500 font-medium uppercase tracking-wider px-4 py-3">{col}</th>
                ))}
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, i: number) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-[#8B5CF6]/5 hover:bg-white/5 transition-colors"
                >
                  {columns.map((col: string) => (
                    <td key={col} className="px-4 py-3 text-sm text-gray-300">{item[col.toLowerCase()] || '-'}</td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <button onClick={() => { setEditing(item); setShowForm(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/10 transition-all">
                          <Edit3 size={14} />
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── NEWS TAB ────────────────────────────────────────────────
function NewsTab({ items, setItems, notify }: any) {
  const handleAdd = (editing: any, close: () => void) => {
    const [form, setForm] = useState(editing || { title: '', content: '', excerpt: '', image_url: '', published: false });
    const [saving, setSaving] = useState(false);

    const save = async () => {
      setSaving(true);
      try {
        if (editing) {
          const updated = await api.news.update(editing.id, form, getToken()!);
          setItems((prev: any) => prev.map((i: any) => i.id === editing.id ? updated : i));
          notify('success', 'Noticia actualizada');
        } else {
          const created = await api.news.create(form, getToken()!);
          setItems((prev: any) => [created, ...prev]);
          notify('success', 'Noticia creada');
        }
        close();
      } catch (err: any) {
        notify('error', err.message);
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Título</label>
          <input value={form.title} onChange={(e) => setForm((p: any) => ({ ...p, title: e.target.value }))} className="input-field" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Extracto</label>
          <input value={form.excerpt} onChange={(e) => setForm((p: any) => ({ ...p, excerpt: e.target.value }))} className="input-field" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Contenido</label>
          <textarea value={form.content} onChange={(e) => setForm((p: any) => ({ ...p, content: e.target.value }))} className="input-field min-h-[120px]" rows={4} />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">URL de Imagen</label>
          <input value={form.image_url} onChange={(e) => setForm((p: any) => ({ ...p, image_url: e.target.value }))} className="input-field" />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm((p: any) => ({ ...p, published: e.target.checked }))} className="rounded" />
          Publicado
        </label>
        <button onClick={save} disabled={saving} className="btn-primary w-full justify-center">
          {saving ? 'Guardando...' : <><Save size={16} /> Guardar</>}
        </button>
      </div>
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta noticia?')) return;
    try {
      await api.news.delete(id, getToken()!);
      setItems((prev: any) => prev.filter((i: any) => i.id !== id));
      notify('success', 'Noticia eliminada');
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  return (
    <CrudTable
      items={items}
      columns={['Título', 'Autor', 'Estado']}
      onAdd={handleAdd}
      onEdit={() => {}}
      onDelete={handleDelete}
      emptyMessage="No hay noticias"
    />
  );
}

// ─── SCHEDULE TAB ───────────────────────────────────────────
function ScheduleTab({ items, setItems, notify }: any) {
  const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const handleAdd = (editing: any, close: () => void) => {
    const [form, setForm] = useState(editing || { title: '', description: '', day_of_week: 1, start_time: '18:00', end_time: '20:00', type: 'entrenamiento', color: '#8B5CF6' });
    const [saving, setSaving] = useState(false);

    const save = async () => {
      setSaving(true);
      try {
        if (editing) {
          const updated = await api.schedule.update(editing.id, form, getToken()!);
          setItems((prev: any) => prev.map((i: any) => i.id === editing.id ? updated : i));
        } else {
          const created = await api.schedule.create(form, getToken()!);
          setItems((prev: any) => [...prev, created]);
        }
        notify('success', editing ? 'Evento actualizado' : 'Evento creado');
        close();
      } catch (err: any) {
        notify('error', err.message);
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Título</label>
          <input value={form.title} onChange={(e) => setForm((p: any) => ({ ...p, title: e.target.value }))} className="input-field" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Descripción</label>
          <input value={form.description} onChange={(e) => setForm((p: any) => ({ ...p, description: e.target.value }))} className="input-field" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Día</label>
            <select value={form.day_of_week} onChange={(e) => setForm((p: any) => ({ ...p, day_of_week: parseInt(e.target.value) }))} className="input-field">
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Tipo</label>
            <select value={form.type} onChange={(e) => setForm((p: any) => ({ ...p, type: e.target.value }))} className="input-field">
              <option value="entrenamiento">Entrenamiento</option>
              <option value="academia">Academia</option>
              <option value="scrim">Scrim</option>
              <option value="premier">Premier</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Inicio</label>
            <input type="time" value={form.start_time} onChange={(e) => setForm((p: any) => ({ ...p, start_time: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Fin</label>
            <input type="time" value={form.end_time} onChange={(e) => setForm((p: any) => ({ ...p, end_time: e.target.value }))} className="input-field" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Color</label>
          <input type="color" value={form.color} onChange={(e) => setForm((p: any) => ({ ...p, color: e.target.value }))} className="h-10 w-full rounded-lg cursor-pointer" />
        </div>
        <button onClick={save} disabled={saving} className="btn-primary w-full justify-center">
          {saving ? 'Guardando...' : <><Save size={16} /> Guardar</>}
        </button>
      </div>
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este evento?')) return;
    try {
      await api.schedule.delete(id, getToken()!);
      setItems((prev: any) => prev.filter((i: any) => i.id !== id));
      notify('success', 'Evento eliminado');
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  return (
    <CrudTable
      items={items}
      columns={['Título', 'Tipo', 'Día', 'Inicio', 'Fin']}
      onAdd={handleAdd}
      onEdit={() => {}}
      onDelete={handleDelete}
      emptyMessage="No hay eventos"
    />
  );
}

// ─── TEAM TAB ────────────────────────────────────────────────
function TeamTab({ items, setItems, notify }: any) {
  const handleAdd = (editing: any, close: () => void) => {
    const [form, setForm] = useState(editing || { name: '', role: 'Duelist', rank: '', status: 'Titular', image_url: '', bio: '' });
    const [saving, setSaving] = useState(false);

    const save = async () => {
      setSaving(true);
      try {
        if (editing) {
          const updated = await api.team.update(editing.id, form, getToken()!);
          setItems((prev: any) => prev.map((i: any) => i.id === editing.id ? updated : i));
        } else {
          const created = await api.team.create(form, getToken()!);
          setItems((prev: any) => [...prev, created]);
        }
        notify('success', editing ? 'Jugador actualizado' : 'Jugador agregado');
        close();
      } catch (err: any) {
        notify('error', err.message);
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Nombre</label>
          <input value={form.name} onChange={(e) => setForm((p: any) => ({ ...p, name: e.target.value }))} className="input-field" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Rol</label>
            <select value={form.role} onChange={(e) => setForm((p: any) => ({ ...p, role: e.target.value }))} className="input-field">
              <option value="Duelist">Duelist</option>
              <option value="Initiator">Initiator</option>
              <option value="Controller">Controller</option>
              <option value="Sentinel">Sentinel</option>
              <option value="Flex">Flex</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Rango</label>
            <input value={form.rank} onChange={(e) => setForm((p: any) => ({ ...p, rank: e.target.value }))} className="input-field" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Estado</label>
          <select value={form.status} onChange={(e) => setForm((p: any) => ({ ...p, status: e.target.value }))} className="input-field">
            <option value="Titular">Titular</option>
            <option value="Suplente">Suplente</option>
            <option value="Prueba">Prueba</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">URL de Imagen</label>
          <input value={form.image_url} onChange={(e) => setForm((p: any) => ({ ...p, image_url: e.target.value }))} className="input-field" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Bio</label>
          <textarea value={form.bio} onChange={(e) => setForm((p: any) => ({ ...p, bio: e.target.value }))} className="input-field min-h-[80px]" />
        </div>
        <button onClick={save} disabled={saving} className="btn-primary w-full justify-center">
          {saving ? 'Guardando...' : <><Save size={16} /> Guardar</>}
        </button>
      </div>
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este jugador?')) return;
    try {
      await api.team.delete(id, getToken()!);
      setItems((prev: any) => prev.filter((i: any) => i.id !== id));
      notify('success', 'Jugador eliminado');
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  return (
    <CrudTable
      items={items}
      columns={['Nombre', 'Rol', 'Rango', 'Estado']}
      onAdd={handleAdd}
      onEdit={() => {}}
      onDelete={handleDelete}
      emptyMessage="No hay jugadores"
    />
  );
}

// ─── SCRIMS TAB ─────────────────────────────────────────────
function ScrimsTab({ items, setItems, notify }: any) {
  const handleAdd = (editing: any, close: () => void) => {
    const today = new Date().toISOString().split('T')[0];
    const [form, setForm] = useState(editing || { opponent: '', our_score: 0, opponent_score: 0, result: 'Pendiente', date: today, notes: '' });
    const [saving, setSaving] = useState(false);

    const save = async () => {
      setSaving(true);
      try {
        if (editing) {
          const updated = await api.scrims.update(editing.id, form, getToken()!);
          setItems((prev: any) => prev.map((i: any) => i.id === editing.id ? updated : i));
        } else {
          const created = await api.scrims.create(form, getToken()!);
          setItems((prev: any) => [created, ...prev]);
        }
        notify('success', editing ? 'Scrim actualizado' : 'Scrim registrado');
        close();
      } catch (err: any) {
        notify('error', err.message);
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Oponente</label>
          <input value={form.opponent} onChange={(e) => setForm((p: any) => ({ ...p, opponent: e.target.value }))} className="input-field" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nuestro Score</label>
            <input type="number" value={form.our_score} onChange={(e) => setForm((p: any) => ({ ...p, our_score: parseInt(e.target.value) || 0 }))} className="input-field" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Su Score</label>
            <input type="number" value={form.opponent_score} onChange={(e) => setForm((p: any) => ({ ...p, opponent_score: parseInt(e.target.value) || 0 }))} className="input-field" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Resultado</label>
            <select value={form.result} onChange={(e) => setForm((p: any) => ({ ...p, result: e.target.value }))} className="input-field">
              <option value="Pendiente">Pendiente</option>
              <option value="Victoria">Victoria</option>
              <option value="Derrota">Derrota</option>
              <option value="Empate">Empate</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Fecha</label>
          <input type="date" value={form.date} onChange={(e) => setForm((p: any) => ({ ...p, date: e.target.value }))} className="input-field" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Notas</label>
          <textarea value={form.notes} onChange={(e) => setForm((p: any) => ({ ...p, notes: e.target.value }))} className="input-field min-h-[80px]" />
        </div>
        <button onClick={save} disabled={saving} className="btn-primary w-full justify-center">
          {saving ? 'Guardando...' : <><Save size={16} /> Guardar</>}
        </button>
      </div>
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este scrim?')) return;
    try {
      await api.scrims.delete(id, getToken()!);
      setItems((prev: any) => prev.filter((i: any) => i.id !== id));
      notify('success', 'Scrim eliminado');
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  return (
    <CrudTable
      items={items}
      columns={['Oponente', 'Resultado', 'Score', 'Fecha']}
      onAdd={handleAdd}
      onEdit={() => {}}
      onDelete={handleDelete}
      emptyMessage="No hay scrims"
    />
  );
}

// ─── RECRUITMENT TAB ────────────────────────────────────────
function RecruitmentTab({ items, setItems, notify }: any) {
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta solicitud?')) return;
    try {
      await api.recruitment.delete(id, getToken()!);
      setItems((prev: any) => prev.filter((i: any) => i.id !== id));
      notify('success', 'Solicitud eliminada');
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const updated = await api.recruitment.update(id, status, getToken()!);
      setItems((prev: any) => prev.map((i: any) => i.id === id ? updated : i));
      notify('success', `Solicitud ${status === 'Aprobado' ? 'aprobada' : status === 'Rechazado' ? 'rechazada' : 'actualizada'}`);
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const pending = items.filter((i: any) => i.status === 'Pendiente');
  const reviewed = items.filter((i: any) => i.status !== 'Pendiente');

  const renderRequest = (request: any) => (
    <div key={request.id} className="glass-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-white">{request.name}</h4>
          <p className="text-sm text-gray-400">{request.riot_id}</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full border ${
          request.status === 'Pendiente' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
          request.status === 'Aprobado' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
          'bg-red-500/20 text-red-400 border-red-500/30'
        }`}>{request.status}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-3">
        <div>Rango: <span className="text-gray-300">{request.rank || '-'}</span></div>
        <div>Rol: <span className="text-gray-300">{request.primary_role || '-'}</span></div>
      </div>
      {request.availability && <p className="text-xs text-gray-500 mb-3">{request.availability}</p>}
      <div className="flex items-center gap-2">
        {request.status === 'Pendiente' && (
          <>
            <button onClick={() => updateStatus(request.id, 'Aprobado')} className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/30 transition-all">Aprobar</button>
            <button onClick={() => updateStatus(request.id, 'Rechazado')} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-all">Rechazar</button>
          </>
        )}
        <button onClick={() => handleDelete(request.id)} className="px-3 py-1.5 rounded-lg bg-gray-500/20 text-gray-400 text-xs font-medium hover:bg-red-500/20 hover:text-red-400 transition-all ml-auto">Eliminar</button>
      </div>
    </div>
  );

  return (
    <div>
      <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
        Pendientes <span className="text-sm text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded-full">{pending.length}</span>
      </h3>
      {pending.length === 0 ? (
        <p className="text-gray-500 text-sm mb-8">No hay solicitudes pendientes</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">{pending.map(renderRequest)}</div>
      )}

      {reviewed.length > 0 && (
        <>
          <h3 className="font-display text-lg font-bold mb-4">Revisadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{reviewed.map(renderRequest)}</div>
        </>
      )}

      {items.length === 0 && <p className="text-center py-12 text-gray-500">No hay solicitudes</p>}
    </div>
  );
}

// ─── MEMBERS TAB ────────────────────────────────────────────
function MembersTab({ items, setItems, notify }: any) {
  const handleAdd = (editing: any, close: () => void) => {
    const [form, setForm] = useState(editing || { name: '', role: '', rank: '', discord_id: '', image_url: '' });
    const [saving, setSaving] = useState(false);

    const save = async () => {
      setSaving(true);
      try {
        if (editing) {
          const updated = await api.members.update(editing.id, form, getToken()!);
          setItems((prev: any) => prev.map((i: any) => i.id === editing.id ? updated : i));
        } else {
          const created = await api.members.create(form, getToken()!);
          setItems((prev: any) => [...prev, created]);
        }
        notify('success', editing ? 'Miembro actualizado' : 'Miembro agregado');
        close();
      } catch (err: any) {
        notify('error', err.message);
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Nombre</label>
          <input value={form.name} onChange={(e) => setForm((p: any) => ({ ...p, name: e.target.value }))} className="input-field" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Rol</label>
          <input value={form.role} onChange={(e) => setForm((p: any) => ({ ...p, role: e.target.value }))} className="input-field" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Rango</label>
            <input value={form.rank} onChange={(e) => setForm((p: any) => ({ ...p, rank: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Discord ID</label>
            <input value={form.discord_id} onChange={(e) => setForm((p: any) => ({ ...p, discord_id: e.target.value }))} className="input-field" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">URL de Imagen</label>
          <input value={form.image_url} onChange={(e) => setForm((p: any) => ({ ...p, image_url: e.target.value }))} className="input-field" />
        </div>
        <button onClick={save} disabled={saving} className="btn-primary w-full justify-center">
          {saving ? 'Guardando...' : <><Save size={16} /> Guardar</>}
        </button>
      </div>
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este miembro?')) return;
    try {
      await api.members.delete(id, getToken()!);
      setItems((prev: any) => prev.filter((i: any) => i.id !== id));
      notify('success', 'Miembro eliminado');
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  return (
    <CrudTable
      items={items}
      columns={['Nombre', 'Rol', 'Rango', 'Discord']}
      onAdd={handleAdd}
      onEdit={() => {}}
      onDelete={handleDelete}
      emptyMessage="No hay miembros"
    />
  );
}

// ─── MEDIA TAB ──────────────────────────────────────────────
function MediaTab({ items, setItems, notify }: any) {
  const handleAdd = (editing: any, close: () => void) => {
    const [form, setForm] = useState(editing || { title: '', url: '', type: 'youtube', thumbnail: '' });
    const [saving, setSaving] = useState(false);

    const save = async () => {
      setSaving(true);
      try {
        const created = await api.media.create(form, getToken()!);
        setItems((prev: any) => [created, ...prev]);
        notify('success', 'Media agregado');
        close();
      } catch (err: any) {
        notify('error', err.message);
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Título</label>
          <input value={form.title} onChange={(e) => setForm((p: any) => ({ ...p, title: e.target.value }))} className="input-field" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">URL</label>
          <input value={form.url} onChange={(e) => setForm((p: any) => ({ ...p, url: e.target.value }))} className="input-field" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Tipo</label>
            <select value={form.type} onChange={(e) => setForm((p: any) => ({ ...p, type: e.target.value }))} className="input-field">
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="clip">Clip</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Thumbnail URL</label>
            <input value={form.thumbnail} onChange={(e) => setForm((p: any) => ({ ...p, thumbnail: e.target.value }))} className="input-field" />
          </div>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary w-full justify-center">
          {saving ? 'Guardando...' : <><Save size={16} /> Guardar</>}
        </button>
      </div>
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este media?')) return;
    try {
      await api.media.delete(id, getToken()!);
      setItems((prev: any) => prev.filter((i: any) => i.id !== id));
      notify('success', 'Media eliminado');
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  return (
    <CrudTable
      items={items}
      columns={['Título', 'Tipo', 'URL']}
      onAdd={handleAdd}
      onEdit={() => {}}
      onDelete={handleDelete}
      emptyMessage="No hay contenido multimedia"
    />
  );
}

// ─── STATS TAB ──────────────────────────────────────────────
function StatsTab({ items, setItems, notify }: any) {
  const handleAdd = (editing: any, close: () => void) => {
    const [form, setForm] = useState(editing || { matches_played: 0, wins: 0, losses: 0, mvp_count: 0, season: 'Temporada 1' });
    const [saving, setSaving] = useState(false);

    const save = async () => {
      setSaving(true);
      try {
        if (editing) {
          const updated = await api.stats.update(editing.id, form, getToken()!);
          setItems((prev: any) => prev.map((i: any) => i.id === editing.id ? updated : i));
        } else {
          const created = await api.stats.create(form, getToken()!);
          setItems((prev: any) => [...prev, created]);
        }
        notify('success', editing ? 'Stats actualizadas' : 'Stats creadas');
        close();
      } catch (err: any) {
        notify('error', err.message);
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Temporada</label>
          <input value={form.season} onChange={(e) => setForm((p: any) => ({ ...p, season: e.target.value }))} className="input-field" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Partidas</label>
            <input type="number" value={form.matches_played} onChange={(e) => setForm((p: any) => ({ ...p, matches_played: parseInt(e.target.value) || 0 }))} className="input-field" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Victorias</label>
            <input type="number" value={form.wins} onChange={(e) => setForm((p: any) => ({ ...p, wins: parseInt(e.target.value) || 0 }))} className="input-field" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Derrotas</label>
            <input type="number" value={form.losses} onChange={(e) => setForm((p: any) => ({ ...p, losses: parseInt(e.target.value) || 0 }))} className="input-field" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">MVPs</label>
            <input type="number" value={form.mvp_count} onChange={(e) => setForm((p: any) => ({ ...p, mvp_count: parseInt(e.target.value) || 0 }))} className="input-field" />
          </div>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary w-full justify-center">
          {saving ? 'Guardando...' : <><Save size={16} /> Guardar</>}
        </button>
      </div>
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar estas estadísticas?')) return;
    try {
      await api.stats.delete(id, getToken()!);
      setItems((prev: any) => prev.filter((i: any) => i.id !== id));
      notify('success', 'Stats eliminadas');
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  return (
    <CrudTable
      items={items}
      columns={['Temporada', 'Partidas', 'Victorias', 'Derrotas', 'MVPs']}
      onAdd={handleAdd}
      onEdit={() => {}}
      onDelete={handleDelete}
      emptyMessage="No hay estadísticas"
    />
  );
}

// ─── PASSWORD TAB ───────────────────────────────────────────
function PasswordTab({ notify }: any) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (form.newPassword !== form.confirmPassword) {
      notify('error', 'Las contraseñas no coinciden');
      return;
    }
    if (form.newPassword.length < 6) {
      notify('error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setSaving(true);
    try {
      await api.auth.changePassword(getToken()!, form.currentPassword, form.newPassword);
      notify('success', 'Contraseña actualizada');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md">
      <p className="text-gray-500 text-sm mb-6">Cambia tu contraseña de administrador.</p>
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Contraseña Actual</label>
          <input type="password" value={form.currentPassword} onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))} className="input-field" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Nueva Contraseña</label>
          <input type="password" value={form.newPassword} onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))} className="input-field" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Confirmar Contraseña</label>
          <input type="password" value={form.confirmPassword} onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))} className="input-field" />
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary justify-center">
          <Key size={16} /> {saving ? 'Actualizando...' : 'Cambiar Contraseña'}
        </button>
      </div>
    </div>
  );
}
