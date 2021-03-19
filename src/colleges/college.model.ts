import * as mongoose from 'mongoose';
import { Contact } from '../common/interfaces/contact.interface';
import { Url } from '../common/interfaces/url.interface';
import { Coordinates } from '../common/interfaces/coordinates.interface';

export const CollegeSchema = new mongoose.Schema(
  {
    orgId: { type: String, default: null },
    profilePhoto: { type: String, required: false },
    collegeLogo: { type: String, required: false },
    collegeBanner: { type: String, required: false },
    collegeLogoThumbnail: { type: String, required: false },
    title: { type: String, required: true },
    url: {
      website: { type: String },
      facebook: { type: String },
      twitter: { type: String },
      linkedIn: { type: String },
    },
    description: { type: String, required: false },
    contact: {
      email: { type: String /*, required: true*/ },
      number: { type: String /*, required: true*/ },
      phoneExtension: { type: String },
      name: { type: String /*, required: true*/ },
    },
    communityCollegeId: { type: String, required: false },
    domain: { type: String, required: false },
    address: { type: String },
    streetAddress: { type: String, default: null },
    city: { type: String },
    state: {
      longName: { type: String },
      shortName: { type: String },
    }, // {type: mongoose.Schema.Types.ObjectId, ref: 'states', required: true},
    zip: { type: String },
    country: String, // {type: mongoose.Schema.Types.ObjectId, ref: 'countries', required: true},
    unmudlShare: { type: Number, default: 15 },
    salesTax: { type: Number, default: 8.25 },
    coordinates: {
      type: {
        type: String,
        default: 'Point',
      },
      coordinates: {
        // must be an array of two numbers i.e. coordinates [lng, lat], first must be longitude
        type: [Number],
        required: true,
      },
    },
    totalRevenue: { type: Number, default: 0, select: false },
    unmudlRevenue: { type: Number, default: 0, select: false },
    collegeRevenue: { type: Number, default: 0, select: false },
    timeZone: {
      offset: { type: Number, default: 6 },
      label: { type: String, default: 'Central' },
      shortForm: { type: String, default: 'CST' },
      value: { type: String, default: 'America/Chicago' },
    },
    stripeId: { type: String, required: false },
    numId: { type: Number, unique: true },
    invitation: { type: String, default: 'pending' },
    partnerGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'partner-groups' },
    isDomainSignup: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    payableToUnmudl: { type: Number, required: false, default: 0 },
  },
  {
    timestamps: true,
  },
);

CollegeSchema.query.byKeyword = function(keyword: string) {
  return this.where({ title: { $regex: keyword, $options: 'i' } });
};

CollegeSchema.query.paginate = function(page: number, perPage: number) {
  return this.skip((page - 1) * perPage).limit(perPage);
};

export interface TimeZone {
  value: string;
  offset: number;
  label: string;
  shortForm: string;
}

export const defaultCollegeTimeZones: TimeZone[] = [
  { label: 'Hawaii', shortForm: 'HST', offset: 10, value: 'America/Adak' },
  { label: 'Alaska', shortForm: 'AST', offset: 9, value: 'America/Anchorage' },
  { label: 'Pacific', shortForm: 'PST', offset: 8, value: 'America/Los_Angeles' },
  { label: 'Mountain', shortForm: 'MST', offset: 7, value: 'America/Boise' },
  { label: 'Central', shortForm: 'CST', offset: 6, value: 'America/Chicago' },
  { label: 'Eastern', shortForm: 'EST', offset: 5, value: 'America/Detroit' },
];

export const defaultCollegeTimeZone: TimeZone = {
  offset: 6,
  label: 'Central',
  shortForm: 'CST',
  value: 'America/Chicago',
};

export interface College {
  _id?: string;
  profilePhoto?: string;
  collegeLogo?: string;
  title: string;
  url?: Url;
  description?: string;
  contact?: Contact;
  communityCollegeId?: string;
  address: string;
  city: string;
  state: { longName: string; shortName: string };
  zip: string;
  country?: string;
  coordinates?: Coordinates;
  timeZone?: string;
  stripeId?: string;
}
