import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEmail } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiHideProperty } from '@nestjs/swagger';
import { IsEitherMailOrPhnNumber } from '../../common/validators';

export class VerifyLearnerDto {
  // @IsNumber()
  @IsNotEmpty()
  readonly verificationCode: number;

  // @IsEmail()
  // @IsNotEmpty()
  // readonly emailAddress: string;
  @IsString()
  @IsOptional()
  readonly phoneNumber?: string;

  @IsEmail()
  @IsOptional()
  @IsEitherMailOrPhnNumber('phoneNumber', { message: responseMessages.createLearner.contact })
  readonly emailAddress?: string;

  @ApiHideProperty()
  learnerId?: string;
}
