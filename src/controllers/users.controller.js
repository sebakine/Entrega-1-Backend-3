import mongoose from 'mongoose';
import { UserModel } from '../models/User.js';

// GET /api/users (la contraseña nunca se expone: ver transform en el modelo)
export const getUsers = async (_req, res) => {
  const users = await UserModel.find();
  return res.status(200).json({ status: 'success', count: users.length, payload: users });
};

// GET /api/users/:uid
export const getUserById = async (req, res) => {
  const { uid } = req.params;
  if (!mongoose.isValidObjectId(uid)) {
    return res.status(400).json({ status: 'error', message: 'Id de usuario inválido' });
  }

  const user = await UserModel.findById(uid);
  if (!user) {
    return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
  }
  return res.status(200).json({ status: 'success', payload: user });
};
