import { Router } from 'express';
import { register, login, current, logout } from '../controllers/sessions.controller.js';
import { passportCall } from '../middlewares/passport.middleware.js';

const router = Router();

// Cada ruta delega la autenticación en passport.authenticate(<estrategia>) vía passportCall
router.post(
  '/register',
  passportCall('register', {
    status: 400,
    message: 'Faltan campos obligatorios: first_name, last_name, email y password',
  }),
  register
);

router.post(
  '/login',
  passportCall('login', { status: 400, message: 'Faltan campos obligatorios: email y password' }),
  login
);

router.get('/current', passportCall('current', { status: 401, message: 'No autenticado' }), current);

router.post('/logout', logout);

export default router;
