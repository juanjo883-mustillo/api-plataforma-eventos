import app from './app.js';
import { connectDB } from './config/database.js';
import { config } from './config/env.js';

async function main() {
  try {
    await connectDB();
    console.log('Conexión a MongoDB establecida');

    app.listen(config.port, () => {
      console.log(`Servidor escuchando en http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
}

main();
