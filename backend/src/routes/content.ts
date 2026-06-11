import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/:section', async (req: Request, res: Response) => {
  const { section } = req.params;
  try {
    const result = await pool.query(
      'SELECT key, value FROM site_content WHERE section = $1',
      [section]
    );
    const content: Record<string, string> = {};
    result.rows.forEach((row) => {
      content[row.key] = row.value;
    });
    res.json(content);
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:section', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { section } = req.params;
  const content = req.body;

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const [key, value] of Object.entries(content)) {
        await client.query(
          `INSERT INTO site_content (section, key, value)
           VALUES ($1, $2, $3)
           ON CONFLICT (section, key)
           DO UPDATE SET value = $3, updated_at = NOW()`,
          [section, key, value]
        );
      }

      await client.query('COMMIT');
      res.json({ message: 'Contenido actualizado exitosamente' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
