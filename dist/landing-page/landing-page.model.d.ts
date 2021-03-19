import * as mongoose from 'mongoose';
export declare const LandingPageSchema: mongoose.Schema<any>;
export interface LandingPage {
    altTag?: string;
    title: string;
    tagLine: string;
}
