import { IsString, IsEmail, IsOptional } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';

export class UpdateBasicDetailsDto {
  @ApiProperty({ required: false, default: '' })
  @IsString({ message: responseMessages.createUser.invalidFullName })
  fullname: string;

  @ApiProperty({ required: false, default: '' })
  @IsEmail({}, { message: responseMessages.createUser.invalidEmail })
  emailAddress: string;

  @ApiProperty({ required: false, default: '' })
  @IsString({ message: responseMessages.createUser.invalidDesignation })
  designation: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  profilePhoto?: any;

  @IsOptional()
  @IsString()
  profilePhotoPath?: string;

  @ApiHideProperty()
  profilePhotoThumbnail?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  bio?: string;
}
