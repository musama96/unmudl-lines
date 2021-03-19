import * as mongoose from 'mongoose';

export const EmployerGroupSchema = new mongoose.Schema(
  {
    title: {type: String, required: true},
    color: {type: String, required: true},
  },
  {
    timestamps: true,
  },
);

export interface EmployerGroupInterface {
  _id?: string;
  title: string;
  color: string;
}
