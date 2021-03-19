import { MailerService } from '@nest-modules/mailer';
import { EmployerRequestListDto } from './dto/employerRequestList.dto';
import { EmailLogsService } from '../email-logs/email-logs.service';
export declare class EmployerRequestsService {
    private readonly employerRequestModel;
    private readonly userModel;
    private readonly mailerService;
    private readonly emailLogsService;
    constructor(employerRequestModel: any, userModel: any, mailerService: MailerService, emailLogsService: EmailLogsService);
    checkEmployerRequest(collegeName: any): Promise<boolean>;
    createEmployerRequest(employerRequest: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEmployerRequests(params: EmployerRequestListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEmployerRequestsCsv(params: EmployerRequestListDto): Promise<any>;
    getEmployerRequestDetails(id: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateEmployerRequestStatus({ employerRequestId, status }: {
        employerRequestId: any;
        status: any;
    }): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    deleteEmployerRequest(requestId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
