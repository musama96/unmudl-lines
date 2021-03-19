import { ChatGroup } from './chat-group.model';
import { Message } from './chat-message.model';
import { NotificationsService } from '../notifications/notifications.service';
export declare class InternalChatService {
    private readonly chatGroupModel;
    private readonly chatMessagesModel;
    private readonly notificationsService;
    constructor(chatGroupModel: any, chatMessagesModel: any, notificationsService: NotificationsService);
    getChatGroups(userId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getMessages(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createChatGroup(chatGroupData: ChatGroup): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    sendMessage(messageData: Message): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    addMembers(addMembersData: {
        chatId: string;
        members: string[];
    }): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getChatGroupDetail(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateReadBy(updateMessage: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
