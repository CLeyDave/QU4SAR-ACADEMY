import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM team_members ORDER BY created_at');
    res.json(result.rows);
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { name, role, rank, status, image_url, bio } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO team_members (name, role, rank, status, image_url, bio)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, role, rank, status || 'Titular', image_url, bio]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create team member error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { name, role, rank, status, image_url, bio } = req.body;
  try {
    const result = await pool.query(
      `UPDATE team_members SET name = $1, role = $2, rank = $3, status = $4,
       image_url = $5, bio = $6 WHERE id = $7 RETURNING *`,
      [name, role, rank, status, image_url, bio, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM team_members WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    res.json({ message: 'Jugador eliminado exitosamente' });
  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
