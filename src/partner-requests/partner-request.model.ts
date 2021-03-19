import * as mongoose from 'mongoose';

export const PartnerRequestSchema = new mongoose.Schema(
  {
    contactPerson: { type: String, required: true, trim: true },
    collegeName: {type: String, required: true, trim: true},
    location: {type: String, required: true, trim: true},
    email: {type: String, required: true, trim: true, lowercase: true},
    phoneNumber: {type: String, required: true, trim: true},
    timezone: {type: String, trim: true},
    dayOfWeek: {type: String, trim: true},
    totalEnrollments: {type: Number },
    nonCreditCourses: {type: Boolean, default: false},
    contactTime: {type: String, default: 'afternoon'},
    additionalInformation: {type: String, required: false},
    status: {type: String, enum: ['pending', 'rejected', 'approved']},
  },
  {
    timestamps: true,
  },
);

PartnerRequestSchema.query.byKeyword = function(keyword: string) {
  return this.where({ collegeName: { $regex: keyword, $options: 'i' } });
};

PartnerRequestSchema.query.paginate = function(page: number, perPage: number) {
  return this.skip((page - 1) * perPage).limit(perPage);
};
