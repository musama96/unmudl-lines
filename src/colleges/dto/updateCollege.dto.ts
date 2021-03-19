import { IsNotEmpty, IsString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import UrlDto from './url.dto';
import ContactDto from './contact.dto';
import CoordinatesDto from '../../common/dto/coordinates.dto';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { StateDto } from '../../common/dto/state.dto';

export class UpdateCollegeDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  collegeLogo?: any;

  @IsOptional()
  @IsString()
  collegeLogoPath?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  collegeBanner?: any;

  @IsOptional()
  @IsString()
  collegeBannerPath?: string;

  @ApiHideProperty()
  collegeLogoThumbnail?: string;

  description?: string;
  communityCollegeId?: string;

  @ApiHideProperty()
  _id?: string;

  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  streetAddress?: string;

  city?: string;

  // @ValidateNested()
  // @Type(() => StateDto)
  // state?: StateDto;

  zip?: string;

  @ApiProperty({ required: false })
  timeZone?: string;

  country?: string;

  @ValidateNested()
  @Type(() => UrlDto)
  url?: UrlDto;

  @ValidateNested()
  @Type(() => ContactDto)
  contact?: ContactDto;
}
