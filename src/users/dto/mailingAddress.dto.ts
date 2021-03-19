import {IsOptional, IsString} from 'class-validator';
import responseMessages from '../../config/responseMessages';

export class MailingAddressDto {
  @IsString({message: responseMessages.updateUser.street})
  @IsOptional()
  street?: string;

  @IsString({message: responseMessages.updateUser.city})
  @IsOptional()
  city?: string;
}
