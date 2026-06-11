import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM media ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { title, url, type, thumbnail } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO media (title, url, type, thumbnail)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, url, type, thumbnail]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create media error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { title, url, type, thumbnail } = req.body;
  try {
    const result = await pool.query(
      `UPDATE media SET title = $1, url = $2, type = $3, thumbnail = $4
       WHERE id = $5 RETURNING *`,
      [title, url, type, thumbnail, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Media no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update media error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM media WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Media no encontrado' });
    }
    res.json({ message: 'Media eliminado exitosamente' });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
