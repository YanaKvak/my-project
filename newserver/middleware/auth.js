import { verifyToken } from '../utils/jwt.js';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    const err = new Error('Токен не предоставлен');
    err.status = 401;
    return next(err);
  }

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    next(err);
  }
};

export default authMiddleware;