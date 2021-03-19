import { IsString, IsEmail, IsNotEmpty, Matches } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class SignUpAdminDto {
  @IsString()
  @IsNotEmpty()
  readonly fullname: string;

  @IsEmail()
  @IsNotEmpty()
  readonly emailAddress: string;

  @IsString()
  @IsNotEmpty()
  readonly username?: string;

  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[A-Za-z]).{6,}$/, '', { message: responseMessages.createUser.invalidPassword })
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  readonly role?: string;

  @IsMongoId(false, { message: responseMessages.common.invalidCollegeId })
  collegeId?: string;

  @IsString()
  @IsNotEmpty()
  designation: string;
}
