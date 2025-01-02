import { Document } from 'mongoose';

export interface IStaff extends Document {
  username: string;
  email: string;
  password: string;
  phno: number;
  refreshToken?:string;
}