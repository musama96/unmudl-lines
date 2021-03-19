import { PartnerRequestsService } from './partner-requests.service';
import { PartnerRequestListDto } from './dto/partnerRequestList.dto';
import { PartnerRequestIdDto } from '../common/dto/partnerRequestId.dto';
import { UpdatePartnerRequestStatusDto } from './dto/updatePartnerRequestStatus.dto';
export declare class PartnerRequestsController {
    private readonly partnerRequestsService;
    constructor(partnerRequestsService: PartnerRequestsService);
    GetPartnerRequests(partnerRequestListDto: PartnerRequestListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetPartnerRequestsCsv(partnerRequestListDto: PartnerRequestListDto): Promise<any>;
    GetPartnerRequestDetails(partnerRequestIdDto: PartnerRequestIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    UpdatePartnerRequestStatus(updatePartnerRequestStatusDto: UpdatePartnerRequestStatusDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    DeletePartnerRequest(partnerRequestIdDto: PartnerRequestIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
