import jwt from 'jsonwebtoken';

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Falta la variable de entorno JWT_SECRET');
  }
  return secret;
};

// Firma un JWT solo con la información mínima del usuario (sin password).
// Se usa desde el controller de login, nunca desde una estrategia de Passport.
export const generateToken = (user) => {
  const payload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, getJwtSecret(), {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
};
