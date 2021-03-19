import { ApplyTo, DiscountCut } from '../../common/enums/createPromo.enum';
export declare class PromoListDto {
    keyword: string;
    courseKeyword: string;
    page: number;
    perPage: number;
    noOfUses: number;
    minDiscount: number;
    maxDiscount: number;
    type?: DiscountCut;
    applyTo?: ApplyTo;
    start?: string;
    end?: string;
    sortOrder?: string;
    sortBy?: string;
    discountType?: string;
    status?: string;
    collegeId?: string;
    courseId?: string;
}
