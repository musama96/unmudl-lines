import { IsString, IsMongoId, IsOptional, ValidateNested } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { StateDto } from '../../common/dto/state.dto';
import { Type } from 'class-transformer';
import CoordinatesDto from '../../common/dto/coordinates.dto';

export class EditLocationInformationDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsOptional()
  coordinates?: CoordinatesDto;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ required: false })
  @ValidateNested()
  @Type(() => StateDto)
  state?: StateDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false })
  @IsString()
  zip: string;
}
