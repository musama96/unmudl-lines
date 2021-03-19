import { ChatType } from '../chat.model';
import { ChatModuleEnum } from './chatList.dto';
export declare class AddChatDto {
    groupName?: string;
    course?: string;
    college?: string;
    employer?: string;
    learner?: string;
    users?: string[];
    employerAdmins?: string[];
    module?: ChatModuleEnum;
    moduleDocumentId?: string;
    createdBy?: string;
    createdByType?: string;
    showToCreator?: boolean;
    type?: ChatType;
}
