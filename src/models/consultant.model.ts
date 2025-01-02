import mongoose, { Schema, model } from 'mongoose';
import { IConsultant } from '../interfaces/consultant.interface';

const consultantSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phno: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    num_of_customers: {
      type: Number,
      required: true,
      default: 0,
    },
    num_of_policies: {
      type: Number,
      required: true,
      default: 0,
    },
    commission: {
      type: Number,
      required: true,
      default: 0,
    },
    refreshToken: {
      type: String,
      default: null,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IConsultant>('Consultant', consultantSchema);
