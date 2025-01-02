import { Document } from 'mongoose';

export interface IConsultant extends Document {
  username: string;
  email: string;
  password: string;
  phno: number;
  region: string;
  refreshToken?:string;
  referenceId: string;
}