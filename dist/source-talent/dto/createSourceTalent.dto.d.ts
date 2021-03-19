export declare enum SourceTalentType {
    LEARNER = "learner",
    USER = "user"
}
export declare class CreateSourceTalentDto {
    title: string;
    message: string;
    type: SourceTalentType;
    course: string;
    college?: string;
    employer?: string;
    createdBy?: string;
}
