import dotenv from 'dotenv';

dotenv.config();

function required(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  return value;
}

export const config = {
  port: required('PORT', 8080),
  nodeEnv: required('NODE_ENV', 'development'),
  mongoUrl: required('MONGO_URL'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: required('JWT_EXPIRES_IN', '1d'),
  mail: {
    host: required('MAIL_HOST'),
    port: Number(required('MAIL_PORT', 587)),
    user: required('MAIL_USER'),
    pass: required('MAIL_PASS'),
    from: required('MAIL_FROM'),
  },
};

export const isProduction = config.nodeEnv === 'production';
