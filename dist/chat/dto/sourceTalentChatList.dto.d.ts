import { SourceTalentType } from '../../source-talent/dto/createSourceTalent.dto';
export declare class SourceTalentChatListDto {
    keyword?: string;
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortOrder?: string;
    archive?: boolean;
    myChatsOnly?: boolean;
    type: SourceTalentType;
    sourceTalents: string[];
}
