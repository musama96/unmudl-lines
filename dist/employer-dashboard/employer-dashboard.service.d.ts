import { EmployerSubscriptionsService } from '../employer-subscriptions/employer-subscriptions.service';
import { BlogsService } from '../blogs/blogs.service';
import { ContactCollegesService } from '../contact-colleges/contact-colleges.service';
import { EmployerPostsService } from '../employer-forums/employer-forums.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SourceTalentService } from '../source-talent/source-talent.service';
import { EmployerDashboardPaginationDto } from './dto/employerDashboardPagination.dto';
import { GetEmployerDashboardDto } from './dto/getEmployerDashboard.dto';
import { CollegesService } from '../colleges/colleges.service';
export declare class EmployerDashboardService {
    private readonly sourceTalentService;
    private readonly collegesService;
    private readonly contactCollegesService;
    private readonly blogsService;
    private readonly employerPostsService;
    private readonly notificationsService;
    private readonly employerSubscriptionsService;
    private readonly employerModel;
    constructor(sourceTalentService: SourceTalentService, collegesService: CollegesService, contactCollegesService: ContactCollegesService, blogsService: BlogsService, employerPostsService: EmployerPostsService, notificationsService: NotificationsService, employerSubscriptionsService: EmployerSubscriptionsService, employerModel: any);
    getCompleteDashboardData(params: GetEmployerDashboardDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getContactCollegeActivity(params: EmployerDashboardPaginationDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getSourceTalentActivity(params: EmployerDashboardPaginationDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEmployerForumActivity(params: EmployerDashboardPaginationDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getDashboardMetrics(params: GetEmployerDashboardDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
