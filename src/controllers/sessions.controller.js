import { generateToken } from '../utils/jwt.js';
import { COOKIE_NAME, COOKIE_MAX_AGE, cookieOptions } from '../utils/cookies.js';

// POST /api/sessions/register
// La estrategia 'register' ya validó y creó el usuario: acá solo se arma la respuesta
export const register = (req, res) => {
  const { _id, first_name, last_name, email, role } = req.user;

  return res.status(201).json({
    status: 'success',
    message: 'Usuario registrado',
    payload: { id: _id, first_name, last_name, email, role },
  });
};

// POST /api/sessions/login
// La estrategia 'login' validó las credenciales; el controller genera el JWT y setea la cookie
export const login = (req, res) => {
  const token = generateToken(req.user);

  res.cookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge: COOKIE_MAX_AGE });

  return res.status(200).json({ status: 'success', message: 'Login correcto' });
};

// GET /api/sessions/current
// La estrategia 'current' dejó { id, email, role } en req.user
export const current = (req, res) => {
  const { id, email, role } = req.user;
  return res.status(200).json({ status: 'success', payload: { id, email, role } });
};

// POST /api/sessions/logout (no pasa por Passport)
export const logout = (_req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions());
  return res.status(200).json({ status: 'success', message: 'Sesión cerrada' });
};
