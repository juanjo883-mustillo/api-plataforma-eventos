import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export function generateToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

export const COOKIE_NAME = 'eventosToken';
