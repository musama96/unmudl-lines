export declare enum EmployerAdminRole {
    RECRUITER = "recruiter",
    ADMIN = "admin",
    SUPERADMIN = "superdamin"
}
export declare class InviteEmployerAdminDto {
    fullname: string;
    emailAddress: string;
    role: EmployerAdminRole;
    invitedBy?: string;
    employerAdminId?: string;
    employerId?: string;
}
