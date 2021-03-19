import { Matches } from 'class-validator';
import responseMessages from '../../config/responseMessages';

export class CreatePasswordDto {
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[A-Za-z]).{6,}$/, '', { message: responseMessages.updateUser.invalidPassword })
  password: string;
}
