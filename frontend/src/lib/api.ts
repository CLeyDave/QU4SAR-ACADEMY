const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const NEXT_API = process.env.NEXT_PUBLIC_NEXT_API_URL || '';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function request(endpoint: string, options: FetchOptions = {}) {
  const { token, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error del servidor' }));
    throw new Error(error.error || 'Error del servidor');
  }

  return res.json();
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    verify: (token: string) =>
      request('/auth/verify', { method: 'POST', token }),
    changePassword: (token: string, currentPassword: string, newPassword: string) =>
      request('/auth/change-password', {
        method: 'POST',
        token,
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
  },

  content: {
    get: (section: string) => request(`/content/${section}`),
    update: (section: string, data: Record<string, string>, token: string) =>
      request(`/content/${section}`, {
        method: 'PUT',
        token,
        body: JSON.stringify(data),
      }),
  },

  news: {
    getAll: () => request('/news'),
    getPublished: () => request('/news/published'),
    getById: (id: string) => request(`/news/${id}`),
    create: (data: any, token: string) =>
      request('/news', {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any, token: string) =>
      request(`/news/${id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify(data),
      }),
    delete: (id: string, token: string) =>
      request(`/news/${id}`, { method: 'DELETE', token }),
  },

  schedule: {
    getAll: () => request('/schedule'),
    create: (data: any, token: string) =>
      request('/schedule', {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any, token: string) =>
      request(`/schedule/${id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify(data),
      }),
    delete: (id: string, token: string) =>
      request(`/schedule/${id}`, { method: 'DELETE', token }),
  },

  team: {
    getAll: () => request('/team'),
    create: (data: any, token: string) =>
      request('/team', {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any, token: string) =>
      request(`/team/${id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify(data),
      }),
    delete: (id: string, token: string) =>
      request(`/team/${id}`, { method: 'DELETE', token }),
  },

  scrims: {
    getAll: () => request('/scrims'),
    create: (data: any, token: string) =>
      request('/scrims', {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any, token: string) =>
      request(`/scrims/${id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify(data),
      }),
    delete: (id: string, token: string) =>
      request(`/scrims/${id}`, { method: 'DELETE', token }),
  },

  recruitment: {
    getAll: (token: string) => request('/recruitment', { token }),
    create: (data: any) =>
      request('/recruitment', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, status: string, token: string) =>
      request(`/recruitment/${id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify({ status }),
      }),
    delete: (id: string, token: string) =>
      request(`/recruitment/${id}`, { method: 'DELETE', token }),
  },

  members: {
    getAll: () => request('/members'),
    create: (data: any, token: string) =>
      request('/members', {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any, token: string) =>
      request(`/members/${id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify(data),
      }),
    delete: (id: string, token: string) =>
      request(`/members/${id}`, { method: 'DELETE', token }),
  },

  media: {
    getAll: () => request('/media'),
    create: (data: any, token: string) =>
      request('/media', {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      }),
    delete: (id: string, token: string) =>
      request(`/media/${id}`, { method: 'DELETE', token }),
  },

  stats: {
    getAll: () => request('/stats'),
    getSummary: () => request('/stats/summary'),
    create: (data: any, token: string) =>
      request('/stats', {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any, token: string) =>
      request(`/stats/${id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify(data),
      }),
    delete: (id: string, token: string) =>
      request(`/stats/${id}`, { method: 'DELETE', token }),
  },

  upload: (file: File, token: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then((res) => res.json());
  },

  // === Next.js API Routes (Fase 12) ===
  tracker: {
    get: (region: string, name: string, tag: string) =>
      fetch(`${NEXT_API}/api/tracker/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`).then((r) =>
        r.json()
      ),
  },

  reports: {
    get: () =>
      fetch(`${NEXT_API}/api/admin/reports`).then((r) => r.json()),
  },

  cohorts: {
    progress: (id: string) =>
      fetch(`${NEXT_API}/api/cohorts/${id}/progress`).then((r) => r.json()),
  },
};
