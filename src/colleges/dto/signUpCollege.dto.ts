import { IsNotEmpty, IsString, ValidateNested, Matches, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { StateDto } from '../../common/dto/state.dto';
import CoordinatesDto from '../../common/dto/coordinates.dto';
import UrlDto from './url.dto';
import ContactDto from './contact.dto';
import responseMessages from '../../config/responseMessages';

export class SignUpCollegeDto {
  @ApiHideProperty()
  _id?: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: responseMessages.common.requiredToken })
  token?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  profilePhoto?: any;

  @ApiHideProperty()
  profilePhotoThumbnail?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  collegeLogo?: any;

  @ApiProperty({ type: 'string', format: 'binary' })
  collegeBanner?: any;

  @ApiHideProperty()
  collegeLogoThumbnail?: string;

  @ApiHideProperty()
  collegeId?: string;

  @ApiHideProperty()
  invitation?: string;

  @IsNotEmpty({ message: responseMessages.createCollege.fullname })
  fullname: string;

  // @IsEmail({}, { message: responseMessages.createCollege.invalidEmail })
  // emailAddress: string;

  // @IsString()
  // @IsNotEmpty()
  // username?: string;

  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[A-Za-z]).{6,}$/, '', { message: responseMessages.createCollege.invalidPassword })
  password: string;

  @IsNotEmpty()
  designation: string;

  role?: string;

  @ApiProperty({ required: false })
  timeZone?: string;

  description?: string;
  communityCollegeId?: string;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsOptional()
  coordinates?: CoordinatesDto;

  @ValidateNested()
  @Type(() => UrlDto)
  url?: UrlDto;

  @ValidateNested()
  @Type(() => ContactDto)
  contact?: ContactDto;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  streetAddress?: string;

  @IsNotEmpty()
  city: string;

  @ValidateNested()
  @Type(() => StateDto)
  state: StateDto;

  @IsNotEmpty()
  zip: string;

  // @IsNotEmpty()
  country?: string;

  // @IsNotEmpty()
  timezone?: string;
}
