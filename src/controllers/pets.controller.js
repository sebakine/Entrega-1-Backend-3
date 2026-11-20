import mongoose from 'mongoose';
import { PetModel } from '../models/Pet.js';

// GET /api/pets
export const getPets = async (_req, res) => {
  const pets = await PetModel.find();
  return res.status(200).json({ status: 'success', count: pets.length, payload: pets });
};

// GET /api/pets/:pid
export const getPetById = async (req, res) => {
  const { pid } = req.params;
  if (!mongoose.isValidObjectId(pid)) {
    return res.status(400).json({ status: 'error', message: 'Id de mascota inválido' });
  }

  const pet = await PetModel.findById(pid);
  if (!pet) {
    return res.status(404).json({ status: 'error', message: 'Mascota no encontrada' });
  }
  return res.status(200).json({ status: 'success', payload: pet });
};
