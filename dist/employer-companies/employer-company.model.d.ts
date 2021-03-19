import * as mongoose from 'mongoose';
import { Url } from '../common/interfaces/url.interface';
import { Coordinates } from '../common/interfaces/coordinates.interface';
export declare const EmployerCompanySchema: mongoose.Schema<any>;
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
    state: {
        longName: string;
        shortName: string;
    };
    zip: string;
    country?: string;
    coordinates?: Coordinates;
    timezone?: string;
    numId?: number;
}
