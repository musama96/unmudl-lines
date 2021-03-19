export declare class AddMembersDto {
    chatId: string;
    users: string[];
    employerAdmins: string[];
    learner: string;
    replaceExistingUsers?: boolean;
    replaceExistingEmployerAdmins?: boolean;
}
