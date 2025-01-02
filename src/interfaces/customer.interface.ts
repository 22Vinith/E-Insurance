import { Document, ObjectId } from 'mongoose';

export interface Customer extends Document {
  _id: string | ObjectId;
  username: string; 
  email: string;
  password: string; 
  phno: number; 
  address?: string; 
  agentId?:ObjectId| null;
  age: number;
  region:string;
  createdAt?: Date;
  updatedAt?: Date; 
  refreshToken?:string;
  profilePhoto?: Buffer;
}