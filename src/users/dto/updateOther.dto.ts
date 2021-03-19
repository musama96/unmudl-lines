import { IsString, IsEnum, IsOptional } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

enum UserRoles {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MANAGER = 'manager',
  INSTRUCTOR = 'instructor',
}

export class UpdateOtherDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidUserId })
  userId: string;

  @ApiProperty()
  @IsString({ message: responseMessages.createUser.invalidFullName })
  fullname: string;

  // @ApiProperty()
  // @IsEmail({}, {message: responseMessages.createUser.invalidEmail})
  // emailAddress: string;

  @ApiProperty()
  @IsString({ message: responseMessages.createUser.invalidDesignation })
  designation: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  profilePhoto?: any;

  @ApiHideProperty()
  profilePhotoThumbnail?: string;

  @IsEnum(UserRoles)
  role: UserRoles;

  @IsOptional()
  @IsString()
  profilePhotoPath?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  bio?: string;
}
