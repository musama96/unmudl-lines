declare enum ChangeEnrollmentStatus {
    PENDING = "pending",
    APPROVED = "approved"
}
export declare class ChangeEnrollmentStatusDto {
    enrollmentId: string;
    status: ChangeEnrollmentStatus;
    sisUserId?: string;
}
export {};
