import { CreateEmployerSubscriptionPromoDto } from './dto/createEmployerSubscription.dto';
import { VerifyEmployerSubscriptionPromoDto } from './dto/verifyPromo.dto';
import { EmployerSubscriptionPromosService } from './employer-subscription-promos.service';
export declare class EmployerSubscriptionPromosController {
    private readonly employerSubscriptionPromosService;
    constructor(employerSubscriptionPromosService: EmployerSubscriptionPromosService);
    createEmployerSubscriptionPromo(createEmployerSubscriptionPromoDto: CreateEmployerSubscriptionPromoDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    verifyPromo(verifyEmployerSubscriptionPromoDto: VerifyEmployerSubscriptionPromoDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
