import { IsNotEmpty, IsString, ValidateNested, IsOptional, IsUrl, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import UrlDto from './url.dto';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class UpdateEmployerCompanyDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  employerLogo?: any;

  @IsOptional()
  @IsString()
  employerLogoPath?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  employerBanner?: any;

  @IsOptional()
  @IsString()
  employerBannerPath?: string;

  @ApiHideProperty()
  employerLogoThumbnail?: string;

  description?: string;

  @IsMongoId(true, { message: responseMessages.common.invalidEmployerId })
  _id?: string;

  @IsNotEmpty()
  title?: string;

  address?: string;

  city?: string;

  zip?: string;

  country?: string;

  @ValidateNested()
  @Type(() => UrlDto)
  @IsOptional()
  url?: UrlDto;

  // use updated mongo decorator
  // @IsArray({ message: responseMessages.common.invalidEmployerIndustriesArray })
  // @IsMongoId(false, { message: responseMessages.common.invalidCollegeId, each: true })
  industries?: string[];

  @IsMongoId(true)
  employerGroup?: string;
}
