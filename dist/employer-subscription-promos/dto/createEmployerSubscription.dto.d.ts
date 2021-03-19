import { DurationDto } from '../../common/dto/duration.dto';
import { ApplyTo, PromoDuration } from '../../common/enums/createPromo.enum';
export declare class CreateEmployerSubscriptionPromoDto {
    title?: string;
    percentage?: number;
    maxUses?: number;
    date?: DurationDto;
    applyToPlans?: ApplyTo;
    duration?: PromoDuration;
    plans?: string[];
    status?: string;
    addedBy?: string;
    stripeTitle?: string;
}
