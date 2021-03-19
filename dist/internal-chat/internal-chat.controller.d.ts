import { InternalChatService } from './internal-chat.service';
import { CreateChatGroupDto } from './dto/createChatGroup.dto';
import { SendMessageDto } from './dto/sendMessage.dto';
import { AddMembersDto } from './dto/addMembers.dto';
import { GetMessagesDto } from './dto/getMessages.dto';
import { ChatIdDto } from './dto/chatIdDto';
import { MessageIdDto } from './dto/messageId.dto';
export declare class InternalChatController {
    private readonly internalChatService;
    constructor(internalChatService: InternalChatService);
    CreateNewChatGroup(createChatGroupDto: CreateChatGroupDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    SendNewMessage(sendMessageDto: SendMessageDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    AddMembers(addMembersDto: AddMembersDto, user: any): Promise<{
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
    GetChatGroups(user: any): Promise<{
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
    GetMessages(getMessagesDto: GetMessagesDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
