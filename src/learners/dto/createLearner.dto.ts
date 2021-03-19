import { IsString, IsEmail, IsNotEmpty, IsOptional, Matches, ValidateNested, IsEnum } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { IsEitherMailOrPhnNumber } from '../../common/validators';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import CoordinatesDto from '../../common/dto/coordinates.dto';
import { StateDto } from '../../common/dto/state.dto';
import { Type } from 'class-transformer';
import { Gender } from '../learner.model';

export class CreateLearnerDto {
  @IsString()
  @IsNotEmpty()
  readonly firstname: string;

  @IsString()
  @IsNotEmpty()
  readonly lastname: string;

  @ApiHideProperty()
  fullname?: string;

  @ApiHideProperty()
  profilePhoto?: string;

  @ApiHideProperty()
  primarySignup?: string;

  @IsString()
  @IsOptional()
  readonly phoneNumber?: string;

  @IsEmail()
  @IsOptional()
  @IsEitherMailOrPhnNumber('phoneNumber', { message: responseMessages.createLearner.contact })
  readonly emailAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  address?: string;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsOptional()
  coordinates?: CoordinatesDto;

  @ApiProperty({ required: false })
  @IsOptional()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => StateDto)
  state?: StateDto;

  @ApiProperty({ required: false })
  @IsOptional()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  zip: string;

  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[A-Za-z]).{6,}$/, '', { message: responseMessages.updateUser.invalidPassword })
  password: string;

  @ApiHideProperty()
  isVerified?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}
