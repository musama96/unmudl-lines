import { DurationDto } from '../../common/dto/duration.dto';
import { ApplyTo, DiscountCut, DiscountMetric, Status } from '../../common/enums/createPromo.enum';
export declare class UpdatePromoDto {
    _id: string;
    title: string;
    discount: number;
    discountMetric: DiscountMetric;
    date: DurationDto;
    applyTo?: ApplyTo;
    type?: DiscountCut;
    status: Status;
    addedBy?: string;
    courses?: string[];
    collegeId?: string;
}
