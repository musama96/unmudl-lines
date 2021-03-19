import { AddChatDto } from './dto/addChat.dto';
import { AddChatReplyDto } from './dto/addReply.dto';
import { ChatListDto } from './dto/chatList.dto';
import { AddMembersDto } from './dto/addMembers.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { GetMembersDto } from './dto/getMembers.dto';
import { SourceTalentChatListDto } from './dto/sourceTalentChatList.dto';
export declare class ChatService {
    private readonly chatModel;
    private readonly messageModel;
    private readonly userModel;
    private readonly employerAdminModel;
    private readonly notificationsService;
    constructor(chatModel: any, messageModel: any, userModel: any, employerAdminModel: any, notificationsService: NotificationsService);
    addChat(chat: AddChatDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getChatDetails(id: any, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    deleteChat(chatId: any, userId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    softDeleteChat(chatId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateChatModuleDocumentId(chatId: any, documentId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    addChatReply(reply: AddChatReplyDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    addMembersToChat({ chatId, users, learner, employerAdmins, replaceExistingEmployerAdmins, replaceExistingUsers }: AddMembersDto): Promise<{
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
    getChatsForAUser(params: ChatListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getSourceTalentChatsForAUser(params: SourceTalentChatListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateShowToCreator(id: any, value: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getChatById(id: any, lean: any, populate: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getMembersForChat(params: GetMembersDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    addChatToArchive(params: any, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
