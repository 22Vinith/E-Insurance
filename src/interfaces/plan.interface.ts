import { Document } from 'mongoose';

export interface IPlan extends Document {
  planName: string;
  planDescription?: string;
  category: string;
  highlight?: string[];
  createdAt: Date;
}