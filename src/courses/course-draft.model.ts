import * as mongoose from 'mongoose';

export const CourseDraftSchema = new mongoose.Schema(
  {
    externalCourseId: { type: String, default: null },
    coverPhoto: { type: String },
    coverPhotoThumbnail: { type: String },
    title: { type: String, required: false },
    institutes: [
      {
        name: { type: String, required: false },
        website: { type: String, required: false },
      },
    ],
    altTag: { type: String },
    url: { type: String },
    isUnmudlOriginal: { type: Boolean, default: false },
    price: { type: Number, required: false },
    displayPrice: { type: Number, default: null },
    enrollmentsAllowed: { type: Number, required: false },
    enrollmentDeadline: { type: Date, required: false },
    autoEnroll: { type: Boolean, default: false },
    instructorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    employers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'employers', required: false }],
    venue: { type: String, required: false },
    address: { type: String, required: false },
    city: { type: String, required: false },
    state: {
      longName: { type: String },
      shortName: { type: String },
    }, // String, // {type: mongoose.Schema.Types.ObjectId, ref: 'states', required: false},
    zip: { type: String, required: false },
    country: String, // {type: mongoose.Schema.Types.ObjectId, ref: 'countries', required: false},
    coordinates: {
      type: {
        type: String,
        default: 'Point',
      },
      coordinates: {
        // must be an array of two numbers, [lng, lat]
        type: [Number],
        required: false,
      },
    },
    followUpCourseId: { type: mongoose.Schema.Types.ObjectId, ref: 'courses' },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'colleges' },
    date: {
      start: { type: Date, required: false, default: null },
      end: { type: Date, required: false, default: null },
    },
    schedule: { type: String, required: false },
    time: [
      {
        hoursOffered: { type: String, required: false },
        start: { type: Date, required: false },
        end: { type: Date, required: false },
      },
    ],
    timeZone: {
      offset: { type: Number, default: 6 },
      label: { type: String, default: 'Central' },
      value: { type: String, default: 'America/Chicago' },
    },
    hoursOffered: [{ type: String, required: false }],
    hoursPerWeek: { type: Number, default: null },
    estimatedWeeks: { type: Number, default: null },
    customSchedule: {
      repeatInterval: { type: Number },
      intervalType: { type: String },
      endDate: { type: Date },
      weekdays: [{ type: Number }],
      occurences: { type: Number },
    },
    attendanceInformation: { type: String },
    description: { type: String, required: false },
    outline: { type: String, required: false },
    eligibilityRestrictions: { type: String, required: false },
    attachments: [{ type: String }], // array of paths
    associateDegrees: [
      {
        CIPTitle: { type: String, required: false },
        CIPCode: { type: String, required: false },
        CIPDefinition: { type: String },
      },
    ],
    certificates: [
      {
        CIPTitle: { type: String, required: false },
        CIPCode: { type: String, required: false },
        CIPDefinition: { type: String },
      },
    ],
    certifications: [
      {
        Id: { type: String, required: true },
        Name: { type: String, required: true },
        Organization: { type: String, required: false },
        Description: { type: String, required: false },
      },
    ],
    licenses: [
      {
        ID: { type: String, required: true },
        Title: { type: String, required: true },
        Description: { type: String, required: false },
      },
    ],
    certificatesPath: [{ type: String, required: false }],
    relatedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'courses' }],
    occupations: [
      {
        code: { type: String },
        title: { type: String },
      },
    ],
    knowledgeOutcomes: [
      {
        id: { type: String },
        name: { type: String },
        description: { type: String },
        level: { type: Number },
      },
    ],
    skillOutcomes: [
      {
        id: { type: String },
        name: { type: String },
        description: { type: String },
        level: { type: Number },
      },
    ],
    experiences: [
      {
        id: { type: String },
        name: { type: String },
        hours: { type: Number },
      },
    ],
    credits: { type: Number, required: false },
    continuingCredits: { type: Number, required: false },
    numId: { type: Number, unique: true },
    instructorDisplayName: { type: String, default: null },
    isDisplayPrice: { type: Boolean, default: false },
    categories: [{ type: String }],
    categoryIds: [{ type: mongoose.Types.ObjectId, ref: 'course-categories' }],
    wioaFunds: { type: Boolean, default: false },
    veteranBenefits: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

CourseDraftSchema.query.byKeyword = function(keyword) {
  return this.where({
    title: {
      $regex: keyword,
      $options: 'i',
    },
  });
};

CourseDraftSchema.query.paginate = function(page, perPage) {
  return this.skip((page - 1) * perPage).limit(perPage);
};
