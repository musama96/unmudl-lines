import { EmployerSubscriptionsService } from './employer-subscriptions.service';
export declare class EmployerSubscriptionsWebhooksController {
    private readonly employerSubscriptionsService;
    constructor(employerSubscriptionsService: EmployerSubscriptionsService);
    paymentSucceeded(body: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    paymentFailed(body: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
