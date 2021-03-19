import { ContactCollegeResponsesService } from './contact-college-responses.service';
import { CreateProposalResponseDto } from './dto/create-proposal-response.dto';
import { ContactCollegesService } from '../contact-colleges/contact-colleges.service';
import { ContactCollegesProposalResponsesListDto } from './dto/contact-colleges-proposals-list.dto';
import { ChatService } from '../chat/chat.service';
import { ContactCollegeProposalResponseIdDto } from '../common/dto/ContactCollegeProposalResponseId.dto';
export declare class ContactCollegeResponsesController {
    private readonly collegeResponsesService;
    private readonly contactCollegesService;
    private readonly chatService;
    constructor(collegeResponsesService: ContactCollegeResponsesService, contactCollegesService: ContactCollegesService, chatService: ChatService);
    getProposalResponses(contactCollegesProposalResponsesListDto: ContactCollegesProposalResponsesListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getProposalResponseDetails(responseIdDto: ContactCollegeProposalResponseIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createProposalResponse(createProposalResponseDto: CreateProposalResponseDto, files: any, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
