import { UserRoles } from '../../users/user.model';
export declare enum Role {
    ADMIN = "admin",
    MODERATOR = "moderator",
    INSTRUCTOR = "instructor",
    MANAGER = "manager",
    SUPERADMIN = "superdamin"
}
export declare class InviteUserDto {
    fullname: string;
    emailAddress: string;
    role: UserRoles;
    courseId?: string;
    invitedBy?: string;
    collegeId?: string;
}
