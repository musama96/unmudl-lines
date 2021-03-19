import * as mongoose from 'mongoose';
import { DurationInterface } from '../common/interfaces/duration.interface';
import { DiscountCut, DiscountMetric, ApplyTo } from '../common/enums/createPromo.enum';
export declare const PromoSchema: mongoose.Schema<any>;
export interface Promo {
    _id?: string;
    title: string;
    discount: number;
    date: DurationInterface;
    applyTo?: ApplyTo;
    discountMetric: DiscountMetric;
    type?: DiscountCut;
    status?: string;
    addedBy?: string;
    courses?: string[];
}
