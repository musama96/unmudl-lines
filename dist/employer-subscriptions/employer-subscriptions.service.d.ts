import { Logger } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import { UpdateEmployerSubscriptionDto } from './dto/updateEmployerSubscription.dto';
import { UpdateCollegeOrStateDto } from './dto/updateCollegeOrState.dto';
import { EmployerAdminsService } from '../employer-admins/employer-admins.service';
import { CollegesService } from '../colleges/colleges.service';
export declare class EmployerSubscriptionsService {
    private readonly stripeService;
    private readonly employerAdminsService;
    private readonly collegesService;
    private readonly employerModel;
    private readonly employerSubscriptionModel;
    private readonly employerSubscriptionPlanModel;
    private readonly employerSubscriptionPromoModel;
    logger: Logger;
    constructor(stripeService: StripeService, employerAdminsService: EmployerAdminsService, collegesService: CollegesService, employerModel: any, employerSubscriptionModel: any, employerSubscriptionPlanModel: any, employerSubscriptionPromoModel: any);
    updateEmployerSubscription(subscription: UpdateEmployerSubscriptionDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    subscriptionInvoicePaymentFailed(invoice: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    subscriptionInvoicePaymentSucceeded(invoice: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateCollegeOrState(updateCollegeOrStateDto: UpdateCollegeOrStateDto): Promise<{
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
    initializeEmployerSubscriptionsIfDoesntExist(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getActiveSubscription(employerId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEmployerCurrentSubscriptionPlan(employerId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEmployerSubscriptionPlanByTitle(title: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEmployerSubscriptionPlanByLevel(level: any): Promise<{
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
    initializeDefaultSubscriptionPlans(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    subscriptionCycleCron(): Promise<void>;
}
