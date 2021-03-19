import * as mongoose from 'mongoose';

export const ContactCollegeProposalsSchema = new mongoose.Schema(
  {
    title: { type: String },
    category: { type: mongoose.Types.ObjectId, ref: 'contact-college-categories' },
    subCategory: { type: mongoose.Types.ObjectId },
    description: { type: String },
    attachments: [{ filename: { type: String }, path: { type: String } }],
    visibility: { type: String, enum: ['all', 'selected', 'location'] },
    colleges: [{ type: mongoose.Types.ObjectId, ref: 'colleges' }],
    locations: [{ type: String, required: false }],
    employer: { type: mongoose.Types.ObjectId, ref: 'employer-companies' },
    addedBy: { type: mongoose.Types.ObjectId, ref: 'employer-admins' },
    showToEmployerAdmins: [{ type: mongoose.Types.ObjectId, ref: 'employer-admins' }],
    collegesLocation: { lat: { type: Number }, lng: { type: Number }, address: { type: String } },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    coordinates: [
      {
        type: {
          type: String,
          default: 'Point',
        },
        coordinates: {
          // must be an array of two numbers, [lng, lat]
          type: [Number],
          required: true,
        },
      },
    ],
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

export const ContactCollegeDraftProposalsSchema = new mongoose.Schema(
  {
    title: { type: String },
    category: { type: mongoose.Types.ObjectId, ref: 'contact-college-categories' },
    subCategory: { type: mongoose.Types.ObjectId },
    description: { type: String },
    attachments: [{ filename: { type: String }, path: { type: String } }],
    visibility: { type: String, enum: ['all', 'selected', 'location'] },
    colleges: [{ type: mongoose.Types.ObjectId, ref: 'colleges' }],
    locations: [{ type: String, required: false }],
    employer: { type: mongoose.Types.ObjectId, ref: 'employer-companies' },
    addedBy: { type: mongoose.Types.ObjectId, ref: 'employer-admins' },
    showToEmployerAdmins: [{ type: mongoose.Types.ObjectId, ref: 'employer-admins' }],
    collegesLocation: { lat: { type: Number }, lng: { type: Number }, address: { type: String } },
    coordinates: [
      {
        type: {
          type: String,
          default: 'Point',
        },
        coordinates: {
          // must be an array of two numbers, [lng, lat]
          type: [Number],
          required: true,
        },
      },
    ],
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);
