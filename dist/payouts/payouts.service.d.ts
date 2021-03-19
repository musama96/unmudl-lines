export declare class PayoutsService {
    private readonly PayoutModel;
    constructor(PayoutModel: any);
    getLastTransactionDate(collegeId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    addPayout(details: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
