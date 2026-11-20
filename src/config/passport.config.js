import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { UserModel } from '../models/User.js';
import { createHash, isValidPassword } from '../utils/hash.js';
import { getJwtSecret } from '../utils/jwt.js';
import { COOKIE_NAME } from '../utils/cookies.js';

const INVALID_CREDENTIALS = 'Credenciales inválidas';
const EMAIL_TAKEN = 'El email ya está registrado';

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';
const normalizeEmail = (email) => email.trim().toLowerCase();

// Fallo "controlado" de una estrategia: el middleware passportCall lo traduce a la respuesta HTTP
const failure = (status, message) => ({ status, message });

// Extrae el JWT desde la cookie HTTP Only `currentUser`
const cookieExtractor = (req) => req?.cookies?.[COOKIE_NAME] ?? null;

/* -------------------------------------------------------------------------- */
/*  Estrategia 'register'                                                      */
/*  Validación, normalización, unicidad del email, hash con bcrypt y rol      */
/*  por defecto (definido en el modelo).                                      */
/* -------------------------------------------------------------------------- */
const registerStrategy = new LocalStrategy(
  { usernameField: 'email', passwordField: 'password', passReqToCallback: true, session: false },
  async (req, email, password, done) => {
    try {
      const { first_name, last_name } = req.body ?? {};

      if (![first_name, last_name, email, password].every(isNonEmptyString)) {
        return done(
          null,
          false,
          failure(400, 'Faltan campos obligatorios: first_name, last_name, email y password')
        );
      }

      const normalizedEmail = normalizeEmail(email);

      const exists = await UserModel.exists({ email: normalizedEmail });
      if (exists) {
        return done(null, false, failure(409, EMAIL_TAKEN));
      }

      const user = await UserModel.create({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: normalizedEmail,
        password: await createHash(password),
      });

      return done(null, user);
    } catch (error) {
      // Carrera entre dos registros simultáneos con el mismo email (índice único)
      if (error?.code === 11000) {
        return done(null, false, failure(409, EMAIL_TAKEN));
      }
      return done(error);
    }
  }
);

/* -------------------------------------------------------------------------- */
/*  Estrategia 'login'                                                         */
/*  Solo valida credenciales. NO genera el JWT (eso lo hace el controller).   */
/* -------------------------------------------------------------------------- */
const loginStrategy = new LocalStrategy(
  { usernameField: 'email', passwordField: 'password', session: false },
  async (email, password, done) => {
    try {
      if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
        return done(null, false, failure(400, 'Faltan campos obligatorios: email y password'));
      }

      const user = await UserModel.findOne({ email: normalizeEmail(email) });

      // Mismo mensaje si el email no existe o la contraseña no coincide
      if (!user || !(await isValidPassword(password, user.password))) {
        return done(null, false, failure(401, INVALID_CREDENTIALS));
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
);

/* -------------------------------------------------------------------------- */
/*  Estrategia 'current'                                                       */
/*  Lee el JWT desde la cookie, lo valida y deja { id, email, role } en       */
/*  req.user (nunca la contraseña).                                           */
/* -------------------------------------------------------------------------- */
const currentStrategy = new JwtStrategy(
  {
    jwtFromRequest: cookieExtractor,
    secretOrKeyProvider: (_req, _rawJwt, done) => {
      try {
        done(null, getJwtSecret());
      } catch (error) {
        done(error);
      }
    },
    algorithms: ['HS256'],
  },
  (payload, done) => {
    const { id, email, role } = payload ?? {};
    if (!id || !email || !role) {
      return done(null, false, failure(401, 'No autenticado'));
    }
    return done(null, { id, email, role });
  }
);

/* -------------------------------------------------------------------------- */
/*  Registro de estrategias                                                    */
/*  Para sumar un provider externo (Google, GitHub, etc.) basta con agregar   */
/*  una entrada a este objeto; app.js no necesita cambios.                    */
/*                                                                            */
/*  Ejemplo:                                                                  */
/*    import { Strategy as GitHubStrategy } from 'passport-github2';          */
/*    github: new GitHubStrategy({ clientID, clientSecret, callbackURL },     */
/*      async (accessToken, refreshToken, profile, done) => { ... }),         */
/* -------------------------------------------------------------------------- */
const strategies = {
  register: registerStrategy,
  login: loginStrategy,
  current: currentStrategy,
};

export const initializePassport = () => {
  for (const [name, strategy] of Object.entries(strategies)) {
    passport.use(name, strategy);
  }
};

export default passport;
