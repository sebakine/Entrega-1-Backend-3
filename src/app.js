import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { connectDB } from './config/db.js';
import { initializePassport } from './config/passport.config.js';
import sessionsRouter from './routes/sessions.router.js';
import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import mocksRouter from './routes/mocks.router.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Passport: las estrategias se definen en src/config/passport.config.js
initializePassport();
app.use(passport.initialize());

app.use('/api/sessions', sessionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);
app.use('/api/mocks', mocksRouter);

app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Ruta no encontrada' });
});

// JSON mal formado u otros errores no controlados
app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ status: 'error', message: 'JSON inválido' });
  }
  console.error(err);
  return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
});

const start = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('Falta la variable de entorno JWT_SECRET');
    }
    await connectDB();
    app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
};

start();

export default app;
