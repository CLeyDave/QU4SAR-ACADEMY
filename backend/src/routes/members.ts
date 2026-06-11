import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM members ORDER BY created_at');
    res.json(result.rows);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { name, role, rank, discord_id, image_url } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO members (name, role, rank, discord_id, image_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, role, rank, discord_id, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create member error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { name, role, rank, discord_id, image_url } = req.body;
  try {
    const result = await pool.query(
      `UPDATE members SET name = $1, role = $2, rank = $3, discord_id = $4, image_url = $5
       WHERE id = $6 RETURNING *`,
      [name, role, rank, discord_id, image_url, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Miembro no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM members WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Miembro no encontrado' });
    }
    res.json({ message: 'Miembro eliminado exitosamente' });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
