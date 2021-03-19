import { UsersService } from '../users/users.service';
import { CollegesService } from '../colleges/colleges.service';
import { User } from '../users/user.model';
import { LearnersService } from '../learners/learners.service';
import { EmployerAdminsService } from '../employer-admins/employer-admins.service';
import { EmployerCompaniesService } from '../employer-companies/employer-companies.service';
import { CreateEmployerSubscriptionPromoDto } from '../employer-subscription-promos/dto/createEmployerSubscription.dto';
export declare class StripeService {
    private readonly usersService;
    private readonly learnersService;
    private readonly collegesService;
    private readonly employerAdminsService;
    private readonly employerCompaniesService;
    private readonly stripe;
    constructor(usersService: UsersService, learnersService: LearnersService, collegesService: CollegesService, employerAdminsService: EmployerAdminsService, employerCompaniesService: EmployerCompaniesService);
    addLearnerPaymentMethod(token: any, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getPaymentMethods(stripeCustomerId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    addCard(user: User, cardToken: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    addCardToEmployer(user: any, cardToken: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCards(user: User): Promise<any[] | {
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createCustomer(user: any): Promise<any>;
    addCustomerCard(stripeCustomerId: string, stripeToken: string): Promise<any>;
    removeCustomerCard(stripeCustomerId: string, cardId: string): Promise<any>;
    listCustomerCards(stripeCustomerId: string): Promise<any>;
    connectStripeAccount(user: User, authorizationCode: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getStripeAccountDetails(stripeId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    } | {
        data: {};
    }>;
    createTransferOnConnectAccount(ConnectedStripeAccountId: string, amount: number, chargeId: string, description: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createPayoutOnConnectAccount(ConnectedStripeAccountId: string, amount: number): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getConnectAccountBalance(ConnectedStripeAccountId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    } | {
        data: {};
    }>;
    refundPaymentToCustomer(id: any, amount?: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    reverseTransfer(id: any, amount?: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    capturePaymentFromCustomer(id: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createEmployerSubscription({ customer, price, card, coupon }: {
        customer: any;
        price: any;
        card: any;
        coupon: any;
    }): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateEmployerSubscription({ newPriceId, subscriptionId, prorate, coupon, downgrade }: {
        newPriceId: any;
        subscriptionId: any;
        prorate: any;
        coupon: any;
        downgrade: any;
    }): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    cancelSubscription({ subscriptionId }: {
        subscriptionId: any;
    }): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createSubscriptionPromo(promo: CreateEmployerSubscriptionPromoDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEmployerInvoices(customer: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getProductPrice(id: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createProduct(plan: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
