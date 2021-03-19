export declare enum EmployerRequestStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class UpdateEmployerRequestStatusDto {
    employerRequestId: string;
    status: EmployerRequestStatus;
}
