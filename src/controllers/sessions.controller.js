import { AuthService } from '../services/auth.service.js';
import { userDTO } from '../dto/user.dto.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { COOKIE_NAME } from '../utils/jwt.js';
import { isProduction } from '../config/env.js';

const authService = new AuthService();

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
};

const loginCookieOptions = {
  ...baseCookieOptions,
  maxAge: 24 * 60 * 60 * 1000, // 1 día
};

export const register = asyncHandler(async (req, res) => {
  // req.user fue completado por la estrategia "register" de passport
  return sendSuccess(res, { statusCode: 201, payload: userDTO(req.user), message: 'Usuario registrado con éxito' });
});

export const login = asyncHandler(async (req, res) => {
  const token = authService.buildTokenForUser(req.user);

  res.cookie(COOKIE_NAME, token, loginCookieOptions);

  return sendSuccess(res, { payload: userDTO(req.user), message: 'Login exitoso' });
});

export const current = asyncHandler(async (req, res) => {
  return sendSuccess(res, { payload: userDTO(req.user) });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(COOKIE_NAME, baseCookieOptions);
  return sendSuccess(res, { message: 'Sesión cerrada correctamente' });
});
