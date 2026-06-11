import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'quasar',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

export async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS site_content (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        section VARCHAR(50) NOT NULL,
        key VARCHAR(100) NOT NULL,
        value TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(section, key)
      );

      CREATE TABLE IF NOT EXISTS news (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        excerpt VARCHAR(500),
        author VARCHAR(100),
        image_url VARCHAR(500),
        published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS schedule (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        day_of_week INTEGER NOT NULL,
        start_time VARCHAR(10) NOT NULL,
        end_time VARCHAR(10) NOT NULL,
        type VARCHAR(50) NOT NULL,
        color VARCHAR(7) DEFAULT '#8B5CF6',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS team_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        role VARCHAR(100) NOT NULL,
        rank VARCHAR(50),
        status VARCHAR(20) DEFAULT 'Titular',
        image_url VARCHAR(500),
        bio TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS scrims (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        opponent VARCHAR(100) NOT NULL,
        our_score INTEGER DEFAULT 0,
        opponent_score INTEGER DEFAULT 0,
        result VARCHAR(10) DEFAULT 'Pendiente',
        date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS recruitment (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        riot_id VARCHAR(100) NOT NULL,
        rank VARCHAR(50),
        primary_role VARCHAR(50),
        availability TEXT,
        status VARCHAR(20) DEFAULT 'Pendiente',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        role VARCHAR(100) NOT NULL,
        rank VARCHAR(50),
        discord_id VARCHAR(100),
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS media (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL,
        type VARCHAR(20) NOT NULL,
        thumbnail VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS stats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        matches_played INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        mvp_count INTEGER DEFAULT 0,
        season VARCHAR(50) DEFAULT 'Temporada 1',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      INSERT INTO users (username, password_hash, role)
      VALUES ('admin', '$2a$10$8KzQMGx5C5Kc5Qy5Q5z5Q.5Q5z5Q5y5Q5z5Q5y5Q5z5Q5y5Q5z5Q', 'admin')
      ON CONFLICT (username) DO NOTHING;
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default pool;
