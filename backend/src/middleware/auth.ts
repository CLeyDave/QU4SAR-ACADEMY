import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  role?: string;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'qu4sar_s3cr3t_k3y_2024_esports') as {
      userId: string;
      role: string;
    };
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}
