import { IsEmail, IsString, IsPhoneNumber, IsOptional, Matches, IsNumberString, MaxLength } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { PHONE_NUMBER_REGEX } from '../../config/config';

export default class ContactDto {
  @IsOptional()
  @IsEmail({}, { message: responseMessages.contact.invalidEmail })
  email?: string;

  @IsOptional()
  // @IsPhoneNumber(null, { message: responseMessages.contact.invalidContactNumber })
  @Matches(PHONE_NUMBER_REGEX, '', { message: responseMessages.common.invalidPhoneNumber })
  number?: string;

  @IsOptional()
  @IsNumberString()
  @MaxLength(5)
  phoneExtension?: string;

  @IsOptional()
  @IsString({ message: responseMessages.contact.invalidContactName })
  name?: string;
}
