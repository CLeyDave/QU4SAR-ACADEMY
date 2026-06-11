import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { initDatabase } from './config/database';
import authRoutes from './routes/auth';
import contentRoutes from './routes/content';
import newsRoutes from './routes/news';
import scheduleRoutes from './routes/schedule';
import teamRoutes from './routes/team';
import scrimsRoutes from './routes/scrims';
import recruitmentRoutes from './routes/recruitment';
import membersRoutes from './routes/members';
import mediaRoutes from './routes/media';
import statsRoutes from './routes/stats';
import uploadRoutes from './routes/upload';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/scrims', scrimsRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`QU4SAR API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export default app;
