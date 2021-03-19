import * as mongoose from 'mongoose';

export const EmployerRequestSchema = new mongoose.Schema(
  {
    contactPerson: { type: String, required: true, trim: true },
    employerName: {type: String, required: true, trim: true},
    location: {type: String, required: true, trim: true},
    email: {type: String, required: true, trim: true, lowercase: true},
    phoneNumber: {type: String, required: true, trim: true},
    timezone: {type: String, trim: true},
    dayOfWeek: {type: String, trim: true},
    contactTime: {type: String, default: 'afternoon'},
    additionalInformation: {type: String, required: false},
    totalEmployees: {type: Number },
    status: {type: String, enum: ['pending', 'rejected', 'approved']},
  },
  {
    timestamps: true,
  },
);

EmployerRequestSchema.query.byKeyword = function(keyword: string) {
  return this.where({ collegeName: { $regex: keyword, $options: 'i' } });
};

EmployerRequestSchema.query.paginate = function(page: number, perPage: number) {
  return this.skip((page - 1) * perPage).limit(perPage);
};
