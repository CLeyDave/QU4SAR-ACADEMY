export interface NewsPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  image_url: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  description: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  type: string;
  color: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  rank: string;
  status: 'Titular' | 'Suplente' | 'Prueba';
  image_url: string;
  bio: string;
  created_at: string;
}

export interface Scrim {
  id: string;
  opponent: string;
  our_score: number;
  opponent_score: number;
  result: 'Victoria' | 'Derrota' | 'Empate' | 'Pendiente';
  date: string;
  notes: string;
  created_at: string;
}

export interface RecruitmentRequest {
  id: string;
  name: string;
  riot_id: string;
  rank: string;
  primary_role: string;
  availability: string;
  status: 'Pendiente' | 'Aprobado' | 'Rechazado';
  created_at: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  rank: string;
  discord_id: string;
  image_url: string;
  created_at: string;
}

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  type: 'youtube' | 'tiktok' | 'clip';
  thumbnail: string;
  created_at: string;
}

export interface Stats {
  id: string;
  matches_played: number;
  wins: number;
  losses: number;
  mvp_count: number;
  season: string;
  win_rate?: number;
}

export interface SiteContent {
  [key: string]: string;
}
