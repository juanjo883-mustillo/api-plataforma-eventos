// Script de seed: crea usuarios de prueba (uno por cada rol) y un evento publicado de ejemplo.
// Uso: npm run seed

import { connectDB } from '../src/config/database.js';
import { UserModel } from '../src/models/user.model.js';
import { EventModel } from '../src/models/event.model.js';
import { hashPassword } from '../src/utils/hash.js';
import mongoose from 'mongoose';

const TEST_USERS = [
  {
    first_name: 'Ana',
    last_name: 'User',
    email: 'user@test.com',
    password: 'Password123',
    role: 'user',
  },
  {
    first_name: 'Beto',
    last_name: 'Organizer',
    email: 'organizer@test.com',
    password: 'Password123',
    role: 'organizer',
  },
  {
    first_name: 'Carla',
    last_name: 'Admin',
    email: 'admin@test.com',
    password: 'Password123',
    role: 'admin',
  },
  {
    first_name: 'Diego',
    last_name: 'Organizer2',
    email: 'organizer2@test.com',
    password: 'Password123',
    role: 'organizer',
  },
];

async function seed() {
  await connectDB();
  console.log('Conectado a MongoDB, sembrando datos de prueba...');

  const createdUsers = {};

  for (const userData of TEST_USERS) {
    const existing = await UserModel.findOne({ email: userData.email });
    if (existing) {
      console.log(`Ya existe: ${userData.email}`);
      createdUsers[userData.email] = existing;
      continue;
    }

    const hashedPassword = await hashPassword(userData.password);
    const user = await UserModel.create({ ...userData, password: hashedPassword });
    createdUsers[userData.email] = user;
    console.log(`Usuario creado: ${userData.email} (${userData.role}) / password: ${userData.password}`);
  }

  const existingEvent = await EventModel.findOne({ title: 'Congreso Tech 2026' });
  if (!existingEvent) {
    await EventModel.create({
      title: 'Congreso Tech 2026',
      description: 'Evento de ejemplo generado por el script de seed.',
      category: 'Tecnología',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // en 30 días
      location: 'Buenos Aires, Argentina',
      capacity: 100,
      price: 0,
      status: 'published',
      organizer: createdUsers['organizer@test.com']._id,
    });
    console.log('Evento de ejemplo creado: Congreso Tech 2026');
  } else {
    console.log('El evento de ejemplo ya existe.');
  }

  console.log('Seed finalizado.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((error) => {
  console.error('Error al sembrar datos:', error);
  process.exit(1);
});
