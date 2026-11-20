import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    pets: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }],
      default: [],
    },
  },
  { timestamps: true }
);

// Nunca exponer la contraseña al convertir el documento a JSON u objeto
const hidePassword = (_doc, ret) => {
  delete ret.password;
  delete ret.__v;
  return ret;
};

userSchema.set('toJSON', { transform: hidePassword });
userSchema.set('toObject', { transform: hidePassword });

export const UserModel = mongoose.model('User', userSchema);
