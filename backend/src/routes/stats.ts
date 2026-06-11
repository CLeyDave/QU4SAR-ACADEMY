import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM stats ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/summary', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT
        COALESCE(SUM(matches_played), 0) as total_matches,
        COALESCE(SUM(wins), 0) as total_wins,
        COALESCE(SUM(losses), 0) as total_losses,
        COALESCE(SUM(mvp_count), 0) as total_mvps
      FROM stats`
    );
    const data = result.rows[0];
    const totalMatches = parseInt(data.total_matches) || 0;
    const totalWins = parseInt(data.total_wins) || 0;
    const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;
    res.json({ ...data, win_rate: winRate });
  } catch (error) {
    console.error('Get stats summary error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { matches_played, wins, losses, mvp_count, season } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO stats (matches_played, wins, losses, mvp_count, season)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [matches_played || 0, wins || 0, losses || 0, mvp_count || 0, season || 'Temporada 1']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create stats error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { matches_played, wins, losses, mvp_count, season } = req.body;
  try {
    const result = await pool.query(
      `UPDATE stats SET matches_played = $1, wins = $2, losses = $3,
       mvp_count = $4, season = $5, updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [matches_played, wins, losses, mvp_count, season, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estadísticas no encontradas' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM stats WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estadísticas no encontradas' });
    }
    res.json({ message: 'Estadísticas eliminadas exitosamente' });
  } catch (error) {
    console.error('Delete stats error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
