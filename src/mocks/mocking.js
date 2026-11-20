import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { createHash } from '../utils/hash.js';

const MOCK_PASSWORD = 'coder123';
const ROLES = ['user', 'admin'];
const SPECIES = ['perro', 'gato', 'conejo', 'hamster', 'loro', 'tortuga', 'pez'];

const { ObjectId } = mongoose.Types;

/**
 * Genera `quantity` mascotas falsas con el formato de un documento de Mongo
 * (con _id, timestamps y __v), listas para devolverse o insertarse.
 */
export const generatePets = (quantity) =>
  Array.from({ length: quantity }, () => {
    const now = new Date();
    return {
      _id: new ObjectId(),
      name: faker.animal.petName(),
      specie: faker.helpers.arrayElement(SPECIES),
      birthDate: faker.date.past({ years: 10 }),
      adopted: false,
      owner: null,
      image: faker.image.url(),
      createdAt: now,
      updatedAt: now,
      __v: 0,
    };
  });

/**
 * Genera `quantity` usuarios falsos con el formato de un documento de Mongo:
 *  - password: "coder123" encriptada con bcrypt
 *  - role: "user" o "admin" de forma aleatoria
 *  - pets: array vacío
 */
export const generateUsers = async (quantity) => {
  // Se hashea una sola vez: todos comparten la misma contraseña "coder123"
  const password = await createHash(MOCK_PASSWORD);

  return Array.from({ length: quantity }, () => {
    const now = new Date();
    const first_name = faker.person.firstName();
    const last_name = faker.person.lastName();
    // Sufijo aleatorio para evitar choques con el índice único de email
    const email = faker.internet
      .email({ firstName: first_name, lastName: last_name, provider: 'mock.com' })
      .replace('@', `.${faker.string.alphanumeric(6)}@`)
      .toLowerCase();

    return {
      _id: new ObjectId(),
      first_name,
      last_name,
      email,
      password,
      role: faker.helpers.arrayElement(ROLES),
      pets: [],
      createdAt: now,
      updatedAt: now,
      __v: 0,
    };
  });
};
