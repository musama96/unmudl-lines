export interface EmployerSubscriptionPlan {
    title: string;
    description: string;
    accountLimit: number;
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
    stripeProductId?: string;
    level: number;
    prices?: {
        monthly: {
            stripeId: string;
            price: number;
        };
        yearly: {
            stripeId: string;
            price: number;
        };
    };
}
export declare const defaultEmployerSubscriptionPlans: EmployerSubscriptionPlan[];
