import passport from 'passport';
import { ApiError } from '../utils/ApiError.js';

// Envuelve passport.authenticate para que la ausencia/invalidez de credenciales
// termine siempre en un error manejado por el middleware central de errores,
// en lugar del comportamiento por defecto de passport.
// - "login"/"current": fallo de autenticación -> 401
// - "register": fallo (por ejemplo, email duplicado o campos faltantes) -> 400
export function passportCall(strategy) {
  return (req, res, next) => {
    passport.authenticate(strategy, { session: false }, (err, user, info) => {
      if (err) return next(err);

      if (!user) {
        const message = info?.message ?? 'No autenticado';
        return next(strategy === 'register' ? ApiError.badRequest(message) : ApiError.unauthorized(message));
      }

      req.user = user;
      next();
    })(req, res, next);
  };
}
