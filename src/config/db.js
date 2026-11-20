import mongoose from 'mongoose';

// Conexión a MongoDB (Atlas) usando la URL definida en las variables de entorno
export const connectDB = async (mongoUrl = process.env.MONGO_URL) => {
  if (!mongoUrl) {
    throw new Error('Falta la variable de entorno MONGO_URL');
  }

  await mongoose.connect(mongoUrl);
  console.log('Conectado a MongoDB');
};
