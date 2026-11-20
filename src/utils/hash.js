import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// Genera el hash de una contraseña en texto plano
export const createHash = (password) => bcrypt.hash(password, SALT_ROUNDS);

// Compara una contraseña en texto plano con su hash
export const isValidPassword = (password, hashedPassword) =>
  bcrypt.compare(password, hashedPassword);
