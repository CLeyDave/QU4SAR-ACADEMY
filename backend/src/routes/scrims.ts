import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM scrims ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get scrims error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { opponent, our_score, opponent_score, result, date, notes } = req.body;
  try {
    const scrimResult = await pool.query(
      `INSERT INTO scrims (opponent, our_score, opponent_score, result, date, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [opponent, our_score || 0, opponent_score || 0, result || 'Pendiente', date, notes]
    );
    res.status(201).json(scrimResult.rows[0]);
  } catch (error) {
    console.error('Create scrim error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { opponent, our_score, opponent_score, result, date, notes } = req.body;
  try {
    const scrimResult = await pool.query(
      `UPDATE scrims SET opponent = $1, our_score = $2, opponent_score = $3,
       result = $4, date = $5, notes = $6 WHERE id = $7 RETURNING *`,
      [opponent, our_score, opponent_score, result, date, notes, req.params.id]
    );
    if (scrimResult.rows.length === 0) {
      return res.status(404).json({ error: 'Scrim no encontrado' });
    }
    res.json(scrimResult.rows[0]);
  } catch (error) {
    console.error('Update scrim error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM scrims WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Scrim no encontrado' });
    }
    res.json({ message: 'Scrim eliminado exitosamente' });
  } catch (error) {
    console.error('Delete scrim error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
