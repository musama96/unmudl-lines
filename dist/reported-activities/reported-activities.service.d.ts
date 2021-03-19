import { SuccessInterface } from '../common/ResponseHandler';
import { ReportedActivity } from './reported-activity.model';
import { NotificationsService } from '../notifications/notifications.service';
import { ReportedActivitiesListDto } from './dto/reportedActivitiesList.dto';
export declare class ReportedActivitiesService {
    private readonly reportedActivityModel;
    private readonly notificationsService;
    constructor(reportedActivityModel: any, notificationsService: NotificationsService);
    addReport(report: ReportedActivity): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getReportedActivities(params: ReportedActivitiesListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getReportedActivityDetails(id: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateReportStatus({ reportedActivityId, status }: {
        reportedActivityId: any;
        status: any;
    }): Promise<SuccessInterface>;
}
