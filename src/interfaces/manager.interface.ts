import { Document } from 'mongoose';

export interface Imanager extends Document {
  username: string;
  email: string;
  password: string;
  phno?: number;
  createdAt?: Date;
  refreshToken?:string;
}
