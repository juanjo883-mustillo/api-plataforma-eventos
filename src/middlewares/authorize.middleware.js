import { ApiError } from '../utils/ApiError.js';

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('No autenticado'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('No tenés permisos para realizar esta acción'));
    }

    next();
  };
}
