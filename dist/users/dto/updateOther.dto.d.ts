declare enum UserRoles {
    ADMIN = "admin",
    MODERATOR = "moderator",
    MANAGER = "manager",
    INSTRUCTOR = "instructor"
}
export declare class UpdateOtherDto {
    userId: string;
    fullname: string;
    designation: string;
    profilePhoto?: any;
    profilePhotoThumbnail?: string;
    role: UserRoles;
    profilePhotoPath?: string;
    bio?: string;
}
export {};
