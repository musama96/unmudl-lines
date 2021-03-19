import { IsNotEmpty, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';
import { isString } from 'util';

export class UpdateLandingPageDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  cover?: any;

  @ApiProperty()
  @IsOptional()
  @IsString()
  altTag?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  pictureCredits?: string;

  @ApiProperty()
  @IsOptional()
  @IsUrl()
  hyperlink?: string;

  @IsNotEmpty({ message: responseMessages.updateLanding.title })
  title: string;

  @IsNotEmpty({ message: responseMessages.updateLanding.tagLine })
  tagLine: string;

  @ApiProperty({ required: false })
  tagLineHyperlink?: string;

  @MinLength(6, { message: 'titleColor must be a hex color code.' })
  titleColor: string;

  @MinLength(6, { message: 'subtitleColor must be a hex color code.' })
  subtitleColor: string;
}
