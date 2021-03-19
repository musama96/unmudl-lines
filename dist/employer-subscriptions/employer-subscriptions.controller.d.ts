import { EmployerSubscriptionsService } from './employer-subscriptions.service';
import { UpdateEmployerSubscriptionDto } from './dto/updateEmployerSubscription.dto';
import { UpdateCollegeOrStateDto } from './dto/updateCollegeOrState.dto';
export declare class EmployerSubscriptionsController {
    private readonly employerSubscriptionsService;
    constructor(employerSubscriptionsService: EmployerSubscriptionsService);
    updateEmployerSubscription(createEmployerSubscriptionDto: UpdateEmployerSubscriptionDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateCollegeOrState(updateCollegeOrStateDto: UpdateCollegeOrStateDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    initializeEmployerSubscriptionsIfDoesntExist(user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEmployerSubscriptionPlans(user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEmployerInvoices(user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    initializeDefaultSubscriptionPlans(user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
