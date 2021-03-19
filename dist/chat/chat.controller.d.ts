import { ChatService } from './chat.service';
import { AddChatDto } from './dto/addChat.dto';
import { AddChatReplyDto } from './dto/addReply.dto';
import { ChatListDto } from './dto/chatList.dto';
import { AddMembersDto } from './dto/addMembers.dto';
import { GetMembersDto } from './dto/getMembers.dto';
import { ChatIdDto } from '../common/dto/chatId.dto';
import { ArchiveChatDto } from './dto/archiveChat.dto';
import { SourceTalentChatListDto } from './dto/sourceTalentChatList.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getMembersForChat(getMembersDto: GetMembersDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    addChat(addChatDto: AddChatDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    addChatReply(addReplyDto: AddChatReplyDto, user: any, files: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getChatsForAUser(chatListDto: ChatListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getSourceTalentChatsForAUser(chatListDto: SourceTalentChatListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getChatDetails(chatIdDto: ChatIdDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    deleteChat(chatIdDto: ChatIdDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    addMembersToChat(addMembersDto: AddMembersDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    initializeContactUnmudlChats(user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    addChatToArchive(archiveChatDto: ArchiveChatDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
