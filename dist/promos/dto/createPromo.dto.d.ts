import { DurationDto } from '../../common/dto/duration.dto';
import { ApplyTo, DiscountCut, DiscountMetric } from '../../common/enums/createPromo.enum';
export declare class CreatePromoDto {
    title: string;
    discount: number;
    discountMetric: DiscountMetric;
    date: DurationDto;
    applyTo?: ApplyTo;
    type?: DiscountCut;
    status?: string;
    addedBy?: string;
    addedByLearner?: string;
    courses?: string[];
    collegeId?: string;
}
