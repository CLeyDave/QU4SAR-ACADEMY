import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM news ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/published', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM news WHERE published = true ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get published news error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM news WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { title, content, excerpt, author, image_url, published } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO news (title, content, excerpt, author, image_url, published)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, content, excerpt, author || 'Admin', image_url, published || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { title, content, excerpt, author, image_url, published } = req.body;
  try {
    const result = await pool.query(
      `UPDATE news SET title = $1, content = $2, excerpt = $3, author = $4,
       image_url = $5, published = $6, updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [title, content, excerpt, author, image_url, published, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM news WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }
    res.json({ message: 'Noticia eliminada exitosamente' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
