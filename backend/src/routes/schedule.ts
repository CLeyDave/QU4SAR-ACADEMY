import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM schedule ORDER BY day_of_week, start_time'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { title, description, day_of_week, start_time, end_time, type, color } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO schedule (title, description, day_of_week, start_time, end_time, type, color)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, day_of_week, start_time, end_time, type, color || '#8B5CF6']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { title, description, day_of_week, start_time, end_time, type, color } = req.body;
  try {
    const result = await pool.query(
      `UPDATE schedule SET title = $1, description = $2, day_of_week = $3,
       start_time = $4, end_time = $5, type = $6, color = $7
       WHERE id = $8 RETURNING *`,
      [title, description, day_of_week, start_time, end_time, type, color, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM schedule WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    res.json({ message: 'Evento eliminado exitosamente' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
