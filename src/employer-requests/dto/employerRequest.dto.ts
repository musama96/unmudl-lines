import { IsEmail, IsString, IsPhoneNumber, IsNumber, IsOptional, IsBoolean, IsEnum, Matches } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';
import { PHONE_NUMBER_REGEX } from '../../config/config';
import { Days } from '../../common/enums/days.enum';
import { TIMEZONE } from '../../common/enums/timezone.enum';

enum ContactTime {
  MORNING = 'morning',
  EVENING = 'evening',
  AFTERNOON = 'afternoon',
}

export class EmployerRequestDto {
  @IsEmail({}, { message: responseMessages.contact.invalidEmail })
  email: string;

  // @IsPhoneNumber(null, { message: responseMessages.contact.invalidContactNumber })
  @Matches(PHONE_NUMBER_REGEX, '', { message: responseMessages.common.invalidPhoneNumber })
  phoneNumber: string;

  @IsString()
  contactPerson: string;

  @IsString()
  employerName: string;

  @IsString()
  location: string;

  // @IsNumber()
  // @IsOptional()
  totalEmployees?: number;

  // @ApiProperty({ type: 'boolean', default: false })
  // @IsBoolean()
  // nonCreditCourses: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  additionalInformation?: string;

  @IsEnum(ContactTime, { message: responseMessages.common.invalidContactTime })
  @ApiProperty({ default: 'afternoon' })
  contactTime: ContactTime;

  @IsEnum(Days)
  @ApiProperty({ default: 'afternoon' })
  dayOfWeek: Days;

  @IsEnum(TIMEZONE)
  @ApiProperty({ default: 'afternoon' })
  timezone: TIMEZONE;
}
