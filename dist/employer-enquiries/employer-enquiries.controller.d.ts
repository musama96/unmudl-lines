import { EmployerEnquiriesService } from './employer-enquiries.service';
import { GetEnquiryMessagesDto } from './dto/getEnquiryMessages.dto';
import { AddUserEnquiryDto } from './dto/addUserEnquiry.dto';
import { AddEnquiryMembersDto } from '../enquiries/dto/addMembers.dto';
import { MessageIdDto } from './dto/messageId.dto';
import { ChatIdDto } from './dto/chatIdDto';
import { AddEmployerEnquiryDto } from './dto/addEmployerEnquiry.dto';
export declare class EmployerEnquiriesController {
    private readonly employerEnquiriesService;
    constructor(employerEnquiriesService: EmployerEnquiriesService);
    AddEnquiryMessage(addEmployerEnquiryDto: AddEmployerEnquiryDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetEnquiries(user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetChatGroupDetail(chatIdDto: ChatIdDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetEnquiryMessages(getEnquiryMessagesDto: GetEnquiryMessagesDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    AddAdminEnquiryReply(addUserEnquiryDto: AddUserEnquiryDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    AddEnquiryMembers(addMembersDto: AddEnquiryMembersDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    UpdateReadBy(messageIdDto: MessageIdDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
