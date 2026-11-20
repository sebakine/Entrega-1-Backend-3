export const COOKIE_NAME = 'currentUser';

export const COOKIE_MAX_AGE = 60 * 60 * 1000; // 1 hora

// Opciones comunes de la cookie del JWT (también se usan para borrarla)
export const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
});
