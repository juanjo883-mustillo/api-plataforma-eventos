import mongoose from 'mongoose';
import { config } from './env.js';

export async function connectDB() {
  if (!config.mongoUrl) {
    throw new Error('MONGO_URL no está definida en las variables de entorno');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUrl);

  return mongoose.connection;
}
