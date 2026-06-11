import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM recruitment ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get recruitment error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { name, riot_id, rank, primary_role, availability } = req.body;
  if (!name || !riot_id) {
    return res.status(400).json({ error: 'Nombre y Riot ID requeridos' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO recruitment (name, riot_id, rank, primary_role, availability)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, riot_id, rank, primary_role, availability]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create recruitment error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE recruitment SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update recruitment error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM recruitment WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    res.json({ message: 'Solicitud eliminada exitosamente' });
  } catch (error) {
    console.error('Delete recruitment error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
