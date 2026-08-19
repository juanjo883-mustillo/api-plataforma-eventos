import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';
import { initPassport } from './config/passport.config.js';
import apiRouter from './routes/index.router.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

initPassport();
app.use(passport.initialize());

app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'API Plataforma de Eventos activa' });
});

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
