import { IsString, IsOptional, IsEmail } from 'class-validator';
import { IsEitherMailOrPhnNumber } from '../../common/validators';
import responseMessages from '../../config/responseMessages';

export class EmailPhoneDto {
  @IsString()
  @IsOptional()
  readonly phoneNumber?: string;

  @IsEmail()
  @IsOptional()
  @IsEitherMailOrPhnNumber('phoneNumber', { message: responseMessages.createLearner.contact })
  readonly emailAddress?: string;
}
