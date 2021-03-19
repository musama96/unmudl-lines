import * as mongoose from 'mongoose';

export enum Ethnicity {
  AMERICAN_INDIAN = 'American Indian or Alaska Native',
  ASIAN = 'Asian',
  AFRICAN_AMERICAN = 'Black or African American',
  NATIVE_HAWAIIAN = 'Native Hawaiian or Other Pacific Islander',
  WHITE = 'White',
  HISPANIC = 'Hispanic or Latino',
  NOT_HISPANIC = 'Not Hispanic or Latino',
  PREFER_NOT_TO_RESPOND = 'Prefer not to respond',
}

export enum PrimarySignup {
  EMAIL_ADDRESS = 'emailAddress',
  PHONE_NUMBER = 'phoneNumber',
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  INTERSEX = 'Intersex',
  TRANSGENDER = 'Transgender',
  NON_BINARY = 'Non-binary',
  PREFER_NOT_TO_RESPOND = 'Prefer not to respond',
}

export enum MilitaryStatus {
  VETERAN = 'Veteran',
  ACTIVE_DUTY = 'Active Duty',
  NATIONAL_GUARD_RESERVES = 'National Guard / Reserves',
  SPOUSE = 'Spouse / Domestic Partner',
  CHILD = 'Child',
  OTHER = 'Other - DOD, Federal Government',
}

export enum MilitaryBenefit {
  GI_BILL = 'GI Bill [Post 9/11 CH 33, Montgomery CH 30, Select Reserve CH 1606]',
  TUITION_REIMBURSEMENT = 'Tuition Reimbursement from Military',
  ARMY_CREDENTIAL = 'Army Credential Assistance Program',
  GOVERNMENT_EDUCATION_BENEFITS = 'Federal Government Education Benefits',
  VETERAN_READINESS = 'Veteran Readiness and Employment',
  DEA = 'Dependent Educational Assistance (DEA)',
  OTHER = 'Other: like scholarships or awards',
  NONE = 'None',
}

export enum CumulativePostNineElevenService {
  THIRTY_SIX_PLUS = '36+ months: 100%',
  THIRTY_MONTHS = '30 months: 90%',
  TWENTY_FOUR_MONTHS = '24 months: 80%',
  EIGHTEEN_MONTHS = '18 months: 70%',
  SIX_MONTHS = '6 months: 60%',
  NINETY_DAYS = '90 days: 50%',
  GYGST_FRY = 'GYGST Fry Scholarship: 100%',
  SERVICE_CONNECTED_DISCHARGE = 'Service-Connected Discharge: 100%',
  PURPLE_HEART_SERVICE = 'Purple Heart Service: 100%',
}

export enum CompletedEnlishment {
  THREE_OR_MORE = '3 or more years',
  TWO_OR_MORE = '2 or more years',
}

export const LearnerSchema = new mongoose.Schema(
  {
    firstname: {type: String, required: true, trim: true},
    lastname: {type: String, required: true, trim: true},
    fullname: { type: String, required: true, trim: true},
    ethnicity: { type: String, default: Ethnicity.PREFER_NOT_TO_RESPOND},
    emailAddress: {type: String, lowercase: true, trim: true, default: null},
    phoneNumber: {type: String, default: null},
    primarySignup: {type: String, default: 'emailAddress'},
    dateOfBirth: {type: Date, default: null},
    // username: {type: String, required: true},
    isVerified: {type: Boolean, default: false},
    hasPassword: {type: Boolean, default: true},
    password: {type: String, select: false},
    courses: [{type: mongoose.Schema.Types.ObjectId, ref: 'courses'}],
    cart: [{
      course: {type: mongoose.Schema.Types.ObjectId, ref: 'courses'},
      promo: {type: mongoose.Schema.Types.ObjectId, ref: 'promos'},
      dateAdded: {type: Date, default: Date.now},
      firstname: {type: String, default: null},
      lastname: {type: String, default: null},
      emailAddress: {type: String, default: null},
      phoneNumber: {type: String, default: null},
      address: {type: String, default: null},
      dateOfBirth: {type: Date, default: null},
      hasStudentId: {type: Boolean, default: null},
      studentId: {type: String, default: null},
      city: {type: String, required: false},
      state: {
        longName: {type: String},
        shortName: {type: String},
      }, // String, // {type: mongoose.Schema.Types.ObjectId, ref: 'states', required: true},
      zip: {type: String, required: false},
      coordinates: {
        type: {
          type: String,
          default: 'Point',
        },
        coordinates: { // must be an array of two numbers, [lng, lat]
          type: [Number],
          required: true,
        },
      },
      veteranBenefits: {type: Boolean, default: false},
      militaryStatus: {type: String, default: null},
      isSpouseActive: {type: Boolean, default: null},
      militaryBenefit: {type: String, default: null},
      // cumulativePostNineElevenService: {type: String, default: null},
      // completedEnlishment: {type: String, default: null},
      // isEligiblePostNineElevenBill: {type: Boolean, default: false},
      // dependentCount: {type: Number, default: null},
      wioaBenefits: {type: Boolean, default: false},
    }],
    veteranBenefits: {type: Boolean, default: false},
    militaryStatus: {type: String, default: null},
    isSpouseActive: {type: Boolean, default: null},
    militaryBenefit: {type: String, default: null},
    // cumulativePostNineElevenService: {type: String, default: null},
    // completedEnlishment: {type: String, default: null},
    // isEligiblePostNineElevenBill: {type: Boolean, default: false},
    // dependentCount: {type: Number, default: null},
    wioaBenefits: {type: Boolean, default: false},
    checkoutList: [{
      course: {type: mongoose.Schema.Types.ObjectId, ref: 'courses'},
      dateAdded: {type: Date, default: Date.now},
    }],
    wishList: [{
      course: {type: mongoose.Schema.Types.ObjectId, ref: 'courses'},
      dateAdded: {type: Date, default: Date.now},
    }],
    // contactNumber: {type: String, required: true},
    profilePhoto: {type: String, default: null},
    profilePhotoThumbnail: {type: String, default: null},
    address: {type: String, default: null},
    city: {type: String, default: null},
    state: {
      longName: {type: String, default: null},
      shortName: {type: String, default: null},
    }, // {type: mongoose.Schema.Types.ObjectId, ref: 'states'},
    zip: {type: String, default: null},
    country: {type: String, default: null},
    coordinates: {
      type: {
        type: String,
        default: 'Point',
      },
      coordinates: { // must be an array of two numbers, [lng, lat]
        type: [Number],
        required: true,
      },
    },
    gender: {type: String, default: Gender.PREFER_NOT_TO_RESPOND},
    totalRevenue: { type: Number, default: 0, select: false },
    unmudlRevenue: { type: Number, default: 0, select: false },
    collegeRevenue: { type: Number, default: 0, select: false },
    blacklisted: {type: Boolean, default: false},
    stripeCustomerId: {type: String, required: false, default: null},
    lastLoggedIn: {type: Date},
    isSuspended: {type: Boolean, default: false},
  },
  {
    timestamps: true,
  },
);

LearnerSchema.query.byCollege = function(collegeId) {
  if (collegeId) {
    return this.where({
      collegeId,
    });
  } else {
    return null;
  }
};

export interface Learner extends mongoose.Document {
  firstname: string;
  lastname: string;
  emailAddress?: string;
  phoneNumber?: string;
  password?: string;
  stripeCustomerId?: string;
  primarySignup?: string;
}
