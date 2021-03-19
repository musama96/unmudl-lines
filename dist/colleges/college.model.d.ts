import * as mongoose from 'mongoose';
import { Contact } from '../common/interfaces/contact.interface';
import { Url } from '../common/interfaces/url.interface';
import { Coordinates } from '../common/interfaces/coordinates.interface';
export declare const CollegeSchema: mongoose.Schema<any>;
export interface TimeZone {
    value: string;
    offset: number;
    label: string;
    shortForm: string;
}
export declare const defaultCollegeTimeZones: TimeZone[];
export declare const defaultCollegeTimeZone: TimeZone;
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
    state: {
        longName: string;
        shortName: string;
    };
    zip: string;
    country?: string;
    coordinates?: Coordinates;
    timeZone?: string;
    stripeId?: string;
}
