import { Schema, model } from 'mongoose';
import { Imanager } from '../interfaces/manager.interface'

const managerSchema = new Schema<Imanager>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phno: {type: Number, match: /^[0-9]{10}$/},
    refreshToken: {type: String, default: null,  required: false }
  },
  { timestamps: true }
);

export default model<Imanager>('manager', managerSchema);