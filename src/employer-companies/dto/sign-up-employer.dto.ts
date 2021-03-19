import { IsNotEmpty, ValidateNested, Matches, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { StateDto } from '../../common/dto/state.dto';
import { IsArray } from '../../common/validators';
import CoordinatesDto from '../../common/dto/coordinates.dto';
import responseMessages from '../../config/responseMessages';
import UrlDto from './url.dto';

export class SignUpEmployerDto {
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
  employerBanner?: any;

  @ApiProperty({ type: 'string', format: 'binary' })
  employerLogo?: any;

  @ApiHideProperty()
  employerLogoThumbnail?: any;

  @ApiHideProperty()
  employerId?: string;

  @ApiHideProperty()
  invitation?: string;

  @IsNotEmpty({ message: responseMessages.createCollege.fullname })
  fullname: string;

  @ApiProperty({ format: 'password' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[A-Za-z]).{6,}$/, '', { message: responseMessages.createCollege.invalidPassword })
  password: string;

  designation: string;

  @ApiHideProperty()
  role?: string;

  @IsNotEmpty()
  size: number;

  @IsOptional()
  @IsArray(true)
  @IsNotEmpty({ each: true })
  industry?: string[];

  description?: string;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsOptional()
  coordinates?: CoordinatesDto;

  @ValidateNested()
  @Type(() => UrlDto)
  @IsOptional()
  url?: UrlDto;

  @IsNotEmpty()
  title: string;

  address?: string;

  city?: string;

  @ValidateNested()
  @Type(() => StateDto)
  state?: StateDto;

  @IsOptional()
  zip?: string;

  country?: string;

  timezone?: string;

  // use updated mongo decorator
  // @IsArray({ message: responseMessages.common.invalidEmployerIndustriesArray })
  // @IsMongoId(false, { message: responseMessages.common.invalidCollegeId, each: true })
  industries?: string[];
}
