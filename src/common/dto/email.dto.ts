import { IsEmail, IsNotEmpty } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../validators/index';

export class EmailDto {
  @IsEmail({}, { message: responseMessages.common.invalidEmail })
  @IsNotEmpty()
  readonly emailAddress: string;

  @IsMongoId(true)
  learnerId?: string;
}
