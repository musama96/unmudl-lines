import { UpdatePreferencesDto } from './updatePreferences.dto';
import { MailingAddressDto } from './mailingAddress.dto';
import { ContactInfoDto } from './contactInfo.dto';
export declare class UpdateUserDto {
    fullname: string;
    emailAddress: string;
    designation: string;
    notifications: UpdatePreferencesDto;
    profilePhoto?: any;
    profilePhotoThumbnail?: string;
    mailingAddress?: MailingAddressDto;
    contact?: ContactInfoDto;
    bio?: string;
}
