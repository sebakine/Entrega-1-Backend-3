import { UserModel } from '../models/User.js';
import { PetModel } from '../models/Pet.js';
import { generatePets, generateUsers } from '../mocks/mocking.js';

const MAX_QUANTITY = 1000;

// Convierte un valor a entero no negativo; devuelve null si no es válido
const parseQuantity = (value, defaultValue) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0 || number > MAX_QUANTITY) return null;
  return number;
};

const invalidQuantity = (res, field) =>
  res.status(400).json({
    status: 'error',
    message: `"${field}" debe ser un número entero entre 0 y ${MAX_QUANTITY}`,
  });

// GET /api/mocks/mockingpets?quantity=N  (por defecto 100)
export const getMockingPets = (req, res) => {
  const quantity = parseQuantity(req.query.quantity, 100);
  if (quantity === null) return invalidQuantity(res, 'quantity');

  return res.status(200).json({ status: 'success', payload: generatePets(quantity) });
};

// GET /api/mocks/mockingusers?quantity=N  (por defecto 50)
export const getMockingUsers = async (req, res) => {
  const quantity = parseQuantity(req.query.quantity, 50);
  if (quantity === null) return invalidQuantity(res, 'quantity');

  const users = await generateUsers(quantity);
  return res.status(200).json({ status: 'success', payload: users });
};

// POST /api/mocks/generateData  body: { "users": N, "pets": M }
// También acepta los parámetros por query string (?users=N&pets=M)
export const generateData = async (req, res) => {
  const source = { ...req.query, ...(req.body ?? {}) };

  const users = parseQuantity(source.users, 0);
  if (users === null) return invalidQuantity(res, 'users');

  const pets = parseQuantity(source.pets, 0);
  if (pets === null) return invalidQuantity(res, 'pets');

  if (users === 0 && pets === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Indicá al menos un valor mayor a 0 en "users" o "pets"',
    });
  }

  const insertedUsers = users > 0 ? await UserModel.insertMany(await generateUsers(users)) : [];
  const insertedPets = pets > 0 ? await PetModel.insertMany(generatePets(pets)) : [];

  return res.status(201).json({
    status: 'success',
    message: `Se insertaron ${insertedUsers.length} usuarios y ${insertedPets.length} mascotas`,
    payload: {
      users: insertedUsers.length,
      pets: insertedPets.length,
      userIds: insertedUsers.map((user) => user._id),
      petIds: insertedPets.map((pet) => pet._id),
    },
  });
};
