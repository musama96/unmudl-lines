import { EmployerRequestsService } from './employer-requests.service';
import { EmployerRequestListDto } from './dto/employerRequestList.dto';
import { EmployerRequestIdDto } from '../common/dto/employerRequestId.dto';
import { UpdateEmployerRequestStatusDto } from './dto/updateEmployerRequestStatus.dto';
export declare class EmployerRequestsController {
    private readonly employerRequestsService;
    constructor(employerRequestsService: EmployerRequestsService);
    GetEmployerRequests(employerRequestListDto: EmployerRequestListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetEmployerRequestsCsv(employerRequestListDto: EmployerRequestListDto): Promise<any>;
    GetEmployerRequestDetails(employerRequestIdDto: EmployerRequestIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    UpdatePartnerRequestStatus(updateEmployerRequestStatusDto: UpdateEmployerRequestStatusDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    DeletePartnerRequest(employerRequestIdDto: EmployerRequestIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
