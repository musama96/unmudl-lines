import { PartnerRequestDto } from './dto/partnerRequest.dto';
import { PartnerRequestsService } from './partner-requests.service';
export declare class LearnerPartnerRequestsController {
    private readonly partnerRequestsService;
    constructor(partnerRequestsService: PartnerRequestsService);
    CreatePartnerRequest(collegeRequestDto: PartnerRequestDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
