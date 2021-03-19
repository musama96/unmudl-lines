import { IsString, IsEmail, IsBoolean, ValidateNested, IsOptional } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { UpdatePreferencesDto } from './updatePreferences.dto';
import { Type } from 'class-transformer';
import { MailingAddressDto } from './mailingAddress.dto';
import { ContactInfoDto } from './contactInfo.dto';

export class UpdateUserDto {
  @ApiProperty({ required: false, default: '' })
  @IsString({ message: responseMessages.createUser.invalidFullName })
  fullname: string;

  @ApiProperty({ required: false, default: '' })
  @IsEmail({}, { message: responseMessages.createUser.invalidEmail })
  emailAddress: string;

  @ApiProperty({ required: false, default: '' })
  @IsString({ message: responseMessages.createUser.invalidDesignation })
  designation: string;

  @ValidateNested()
  @Type(() => UpdatePreferencesDto)
  notifications: UpdatePreferencesDto;

  @ApiProperty({ type: 'string', format: 'binary' })
  profilePhoto?: any;

  @ApiHideProperty()
  profilePhotoThumbnail?: string;

  @ValidateNested()
  @Type(() => MailingAddressDto)
  mailingAddress?: MailingAddressDto;

  @ValidateNested()
  @Type(() => ContactInfoDto)
  contact?: ContactInfoDto;

  @ApiProperty()
  @IsOptional()
  @IsString()
  bio?: string;
}
