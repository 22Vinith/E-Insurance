import { Schema, model } from 'mongoose';
import { IPlan } from '../interfaces/plan.interface';

const planSchema = new Schema<IPlan>(
  {
    planName: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    highlight: { type: [String], maxlength: 5 },
  },
  { timestamps: true }
);

export default model<IPlan>('Plan', planSchema);