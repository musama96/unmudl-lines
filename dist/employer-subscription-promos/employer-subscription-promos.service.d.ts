import { StripeService } from '../stripe/stripe.service';
import { CreateEmployerSubscriptionPromoDto } from './dto/createEmployerSubscription.dto';
import { VerifyEmployerSubscriptionPromoDto } from './dto/verifyPromo.dto';
export declare class EmployerSubscriptionPromosService {
    private readonly employerSubscriptionPromoModel;
    private readonly stripeService;
    constructor(employerSubscriptionPromoModel: any, stripeService: StripeService);
    createEmployerSubscriptionPromo(promo: CreateEmployerSubscriptionPromoDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    verifyPromo({ title, plan }: VerifyEmployerSubscriptionPromoDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
