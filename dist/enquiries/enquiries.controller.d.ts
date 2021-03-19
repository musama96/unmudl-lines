import { EnquiriesService } from './enquiries.service';
import { GetEnquiryMessagesDto } from './dto/getEnquiryMessages.dto';
import { AddUserEnquiryDto } from './dto/addUserEnquiry.dto';
import { AddEnquiryMembersDto } from './dto/addMembers.dto';
import { MessageIdDto } from '../internal-chat/dto/messageId.dto';
import { ChatIdDto } from '../internal-chat/dto/chatIdDto';
export declare class EnquiriesController {
    private readonly enquiriesService;
    constructor(enquiriesService: EnquiriesService);
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
    AddEnquiryReply(addUserEnquiryDto: AddUserEnquiryDto, user: any): Promise<{
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
