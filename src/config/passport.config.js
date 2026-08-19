import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { UserRepository } from '../repositories/user.repository.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { config } from './env.js';
import { COOKIE_NAME } from '../utils/jwt.js';

const userRepository = new UserRepository();

function cookieExtractor(req) {
  return req?.cookies?.[COOKIE_NAME] ?? null;
}

export function initPassport() {
  // Estrategia de registro: crea el usuario con role "user" fijo (no acepta role del body).
  passport.use(
    'register',
    new LocalStrategy(
      { usernameField: 'email', passReqToCallback: true },
      async (req, email, password, done) => {
        try {
          const { first_name, last_name } = req.body;

          if (!first_name || !last_name || !email || !password) {
            return done(null, false, { message: 'Faltan campos obligatorios' });
          }

          const existingUser = await userRepository.getUserByEmail(email);
          if (existingUser) {
            return done(null, false, { message: 'El email ya está registrado' });
          }

          const hashedPassword = await hashPassword(password);

          const newUser = await userRepository.createUser({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            role: 'user',
          });

          return done(null, newUser);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Estrategia de login: valida credenciales contra la base de datos.
  passport.use(
    'login',
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: 'Credenciales inválidas' });
        }

        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
          return done(null, false, { message: 'Credenciales inválidas' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Estrategia "current": valida el JWT guardado en la cookie httpOnly.
  passport.use(
    'current',
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: config.jwtSecret,
      },
      async (payload, done) => {
        try {
          const user = await userRepository.getUserById(payload.id);
          if (!user) {
            return done(null, false);
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

export default passport;
