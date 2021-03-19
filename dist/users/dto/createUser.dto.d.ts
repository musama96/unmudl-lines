import { ContactInfoDto } from './contactInfo.dto';
import { StateDto } from '../../common/dto/state.dto';
export declare enum Role {
    ADMIN = "admin",
    MODERATOR = "moderator",
    INSTRUCTOR = "instructor",
    MANAGER = "manager"
}
export declare class CreateUserDto {
    token?: string;
    readonly fullname: string;
    password: string;
    userId?: string;
    contact?: ContactInfoDto;
    city: string;
    state: StateDto;
    zip: string;
    profilePhoto?: any;
    profilePhotoThumbnail?: string;
    joinDate?: string;
    bio?: string;
}
