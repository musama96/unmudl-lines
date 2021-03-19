import * as mongoose from 'mongoose';
import { Url } from '../common/interfaces/url.interface';
import { Coordinates } from '../common/interfaces/coordinates.interface';

export const EmployerCompanySchema = new mongoose.Schema(
  {
    employerLogo: { type: String, required: false },
    employerBanner: { type: String, required: false },
    employerLogoThumbnail: { type: String, required: false },
    title: { type: String, required: true },
    url: { website: { type: String } },
    description: { type: String, required: false },
    size: { type: Number, required: false },
    industries: [{ type: mongoose.Types.ObjectId, ref: 'employer-industries', required: false }],
    address: { type: String },
    city: { type: String },
    state: {
      longName: { type: String },
      shortName: { type: String },
    }, // {type: mongoose.Schema.Types.ObjectId, ref: 'states', required: true},
    zip: { type: String },
    country: String, // {type: mongoose.Schema.Types.ObjectId, ref: 'countries', required: true},
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
    employerGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-groups' },
    isDomainSignup: { type: Boolean, default: false },
    timezone: { type: String, required: false },
    numId: { type: Number, unique: true },
    invitation: { type: String, default: 'pending' },
    stripeCustomerId: { type: String },
    isSuspended: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

EmployerCompanySchema.query.byKeyword = function(keyword: string) {
  return this.where({ title: { $regex: keyword, $options: 'i' } });
};

EmployerCompanySchema.query.paginate = function(page: number, perPage: number) {
  return this.skip((page - 1) * perPage).limit(perPage);
};

export interface EmployerCompany {
  _id?: string;
  profilePhoto?: string;
  employerLogo?: string;
  employerBanner?: string;
  employerLogoThumbnail?: string;
  title: string;
  url?: Url;
  description?: string;
  address: string;
  city: string;
  state: { longName: string; shortName: string };
  zip: string;
  country?: string;
  coordinates?: Coordinates;
  timezone?: string;
  numId?: number;
}
