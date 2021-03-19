import { IsString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import UrlDto from './url.dto';
import ContactDto from './contact.dto';
import CoordinatesDto from '../../common/dto/coordinates.dto';
import { ApiProperty } from '@nestjs/swagger';
import { StateDto } from '../../common/dto/state.dto';

export class CreateCollegeDto {
  _id?: string;
  @ApiProperty({ type: 'string', format: 'binary' })
  profilePhoto?: any;
  @ApiProperty({ type: 'string', format: 'binary' })
  collegeLogo?: any;
  description?: string;
  communityCollegeId?: string;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates: CoordinatesDto;

  @ValidateNested()
  @Type(() => UrlDto)
  url: UrlDto;

  @ValidateNested()
  @Type(() => ContactDto)
  contact: ContactDto;

  @IsString()
  title: string;

  // @IsString()
  // @IsOptional()
  // domain?: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @ValidateNested()
  @Type(() => StateDto)
  state: StateDto;

  @IsString()
  zip: string;

  @IsString()
  country: string;

  @IsString()
  timezone: string;
}
