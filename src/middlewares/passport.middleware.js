import passport from 'passport';

/**
 * Ejecuta una estrategia de Passport (sin sesiones) y traduce sus fallos a la
 * respuesta JSON de la API. Si la autenticación es exitosa, deja el usuario en
 * req.user y pasa al siguiente middleware / controller.
 *
 * @param {string} strategy  nombre de la estrategia registrada en passport.config.js
 * @param {object} fallback  status y mensaje a usar cuando la estrategia falla sin
 *                           un motivo propio (ej. faltan credenciales o no hay token)
 */
export const passportCall = (strategy, { status = 401, message = 'No autenticado' } = {}) =>
  (req, res, next) => {
    passport.authenticate(strategy, { session: false }, (error, user, info) => {
      if (error) return next(error);

      if (!user) {
        const hasOwnReason = info && typeof info.status === 'number';
        return res.status(hasOwnReason ? info.status : status).json({
          status: 'error',
          message: hasOwnReason ? info.message : message,
        });
      }

      req.user = user;
      return next();
    })(req, res, next);
  };
