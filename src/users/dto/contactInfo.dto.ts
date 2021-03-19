import { IsOptional, IsPhoneNumber, IsString, Matches } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { PHONE_NUMBER_REGEX } from '../../config/config';

export class ContactInfoDto {
  // @IsPhoneNumber(null, {message: responseMessages.updateUser.contactNumber})
  @Matches(PHONE_NUMBER_REGEX, '', { message: responseMessages.common.invalidPhoneNumber })
  @IsOptional()
  number?: string;

  @IsString({ message: responseMessages.updateUser.linkedIn })
  @IsOptional()
  linkedIn?: string;
}
