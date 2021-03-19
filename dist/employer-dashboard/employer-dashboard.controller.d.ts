import { EmployerDashboardPaginationDto } from './dto/employerDashboardPagination.dto';
import { GetEmployerDashboardDto } from './dto/getEmployerDashboard.dto';
import { EmployerDashboardService } from './employer-dashboard.service';
export declare class EmployerDashboardController {
    private readonly employerDashboardService;
    constructor(employerDashboardService: EmployerDashboardService);
    getCompleteDashboardData(getEmployerDashboardDto: GetEmployerDashboardDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getDashboardMetrics(getEmployerDashboardDto: GetEmployerDashboardDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getContactCollegeActivity(employerDashboardPaginationDto: EmployerDashboardPaginationDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getSourceTalentActivity(employerDashboardPaginationDto: EmployerDashboardPaginationDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEmployerForumActivity(employerDashboardPaginationDto: EmployerDashboardPaginationDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
