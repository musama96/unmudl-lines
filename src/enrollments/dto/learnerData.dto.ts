import { IsArray, IsOptional, IsNumber, IsMongoId, IsDateString, IsString, IsBoolean, IsISO8601, ValidateNested, Matches, IsEnum } from 'class-validator';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { Type } from 'class-transformer';
import CoordinatesDto from '../../common/dto/coordinates.dto';
import { StateDto } from '../../common/dto/state.dto';
import { Gender, MilitaryStatus, MilitaryBenefit, CumulativePostNineElevenService, CompletedEnlishment } from '../../learners/learner.model';

export class LearnerDataDto {
  @IsOptional()
  @IsString()
  firstname?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsString()
  emailAddress?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @Matches(/((0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-[12]\d{3})/,
  {message: responseMessages.common.invalidDateOfBirth})
  dateOfBirth?: string;

  @IsOptional()
  @IsBoolean()
  hasStudentId?: boolean;

  @IsOptional()
  @IsString()
  studentId?: string;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsOptional()
  coordinates?: CoordinatesDto;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ required: false })
  @ValidateNested()
  @Type(() => StateDto)
  state?: StateDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiHideProperty()
  fullname?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

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
  // cumulativePostNineElevenService?: CumulativePostNineElevenService;
  // completedEnlishment?: CompletedEnlishment;
  // isEligiblePostNineElevenBill?: boolean;
  // dependentCount?: number;
  wioaBenefits?: boolean;
}
