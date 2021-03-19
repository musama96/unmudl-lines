export declare class ActivitiesService {
    private readonly activityModel;
    private readonly userActivityModel;
    private readonly transactionActivityModel;
    private readonly userModel;
    private readonly courseModel;
    constructor(activityModel: any, userActivityModel: any, transactionActivityModel: any, userModel: any, courseModel: any);
    getActivities(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getTransactionActivitiesCsv(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createActivities(activities: any): Promise<any>;
    getUserActivityId(name: string): Promise<any>;
    getTransactionActivityId(name: string): Promise<any>;
}
