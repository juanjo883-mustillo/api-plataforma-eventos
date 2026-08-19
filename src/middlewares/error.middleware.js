import { ApiError } from '../utils/ApiError.js';
import { isProduction } from '../config/env.js';

export function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ status: 'error', message: err.message });
  }

  // Errores de validación de Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    return res.status(400).json({ status: 'error', message });
  }

  // Duplicidad de clave única (por ejemplo, email repetido)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'campo';
    return res.status(409).json({ status: 'error', message: `Ya existe un registro con ese ${field}` });
  }

  // Id inválido de Mongo
  if (err.name === 'CastError') {
    return res.status(400).json({ status: 'error', message: 'Identificador inválido' });
  }

  console.error(err);

  return res.status(500).json({
    status: 'error',
    message: isProduction ? 'Error interno del servidor' : err.message,
  });
}
