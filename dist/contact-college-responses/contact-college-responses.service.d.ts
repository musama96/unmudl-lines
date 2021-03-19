import { ContactCollegesProposalResponsesListDto } from './dto/contact-colleges-proposals-list.dto';
import { CreateProposalResponseDto } from './dto/create-proposal-response.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ContactCollegeResponsesService {
    private readonly contactCollegeResponseModel;
    private readonly messageModel;
    private readonly employerAdminModel;
    private readonly userModel;
    private readonly learnerModel;
    private readonly notificationsService;
    constructor(contactCollegeResponseModel: any, messageModel: any, employerAdminModel: any, userModel: any, learnerModel: any, notificationsService: NotificationsService);
    getProposalResponses(params: ContactCollegesProposalResponsesListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getProposalResponseDetails(responseId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createProposalResponse(response: CreateProposalResponseDto, employer: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
