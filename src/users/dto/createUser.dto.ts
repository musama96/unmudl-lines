import { IsString, IsNotEmpty, IsOptional, Matches, ValidateNested } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { ContactInfoDto } from './contactInfo.dto';
import { Type } from 'class-transformer';
import { StateDto } from '../../common/dto/state.dto';
import { IsMongoId } from '../../common/validators';

export enum Role {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  INSTRUCTOR = 'instructor',
  MANAGER = 'manager',
}

export class CreateUserDto {
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: responseMessages.common.requiredToken })
  token?: string;

  @IsString()
  @IsNotEmpty()
  readonly fullname: string;

  // @IsEmail()
  // @IsNotEmpty()
  // readonly emailAddress: string;

  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[A-Za-z]).{6,}$/, '', { message: responseMessages.updateUser.invalidPassword })
  password: string;

  // @IsString()
  // @IsEnum(Role, { message: responseMessages.createUser.invalidRole })
  // readonly role?: Role;

  // @ApiHideProperty()
  // @IsOptional()
  // @IsMongoId({message: responseMessages.common.invalidCollegeId})
  // collegeId?: string;

  // @IsNotEmpty()
  // designation: string;
  @ApiHideProperty()
  userId?: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => ContactInfoDto)
  contact?: ContactInfoDto;

  // @IsNotEmpty()
  // mailingAddress: string;

  @ApiProperty({ description: 'Only for unmudl admin' })
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Only for unmudl admin' })
  @ValidateNested()
  @Type(() => StateDto)
  state: StateDto;

  @ApiProperty({ description: 'Only for unmudl admin' })
  @IsNotEmpty()
  zip: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  profilePhoto?: any;

  @ApiHideProperty()
  profilePhotoThumbnail?: string;

  @ApiHideProperty()
  joinDate?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  bio?: string;
}
