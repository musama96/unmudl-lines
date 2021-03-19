import { IsString, IsEmail, IsNotEmpty, IsOptional, ValidateIf, Matches, IsEnum } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Ethnicity, Gender, MilitaryStatus, MilitaryBenefit, CumulativePostNineElevenService, CompletedEnlishment } from '../learner.model';
import responseMessages from '../../config/responseMessages';

export class EditPersonalInformationDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @ApiHideProperty()
  fullname?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(Ethnicity)
  ethnicity?: Ethnicity;

  @ApiProperty()
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  // @ApiProperty({ type: 'string', format: 'binary' })
  // profilePhoto?: any;

  // @ApiProperty({description: 'path of existing profile image if empty profile photo will be set to null.'})
  // @IsString()
  // @IsOptional()
  // readonly profilePhotoPath?: string;

  // @IsPhoneNumber(null)
  @ApiProperty({ required: false })
  @ValidateIf(o => !o.emailAddress || o.phoneNumber)
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @ValidateIf(o => !o.phoneNumber || o.emailAddress)
  emailAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(/((0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-[12]\d{3})/,
  {message: responseMessages.common.invalidDateOfBirth})
  dateOfBirth?: string;

  veteranBenefits?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsEnum(MilitaryStatus)
  militaryStatus?: MilitaryStatus;

  isSpouseActive?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsEnum(MilitaryBenefit)
  militaryBenefit?: MilitaryBenefit;
  
  wioaBenefits?: boolean;
}
