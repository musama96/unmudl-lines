export declare enum ChatModuleEnum {
    INTERNAL_CHAT = "internal-chat",
    EMPLOYER_PROPOSAL_RESPONSE = "employer-proposal-response",
    SOURCE_TALENT = "source-talent",
    ENQUIRIES = "enquiries"
}
export declare class ChatListDto {
    keyword?: string;
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortOrder?: string;
    archive?: boolean;
    myChatsOnly?: boolean;
    module?: ChatModuleEnum;
    moduleDocumentIds?: string[];
}
