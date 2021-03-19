import { IsString, IsOptional, IsNumber, IsMongoId, IsBoolean } from 'class-validator';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import errorMessages from '../../config/responseMessages';

export class PostListDto {
  @ApiProperty({ required: false, default: '' })
  @IsOptional()
  @IsString({ message: errorMessages.common.invalidKeyword })
  keyword?: string;

  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  // @IsNumber({}, { message: errorMessages.common.invalidPage })
  page: number;

  @ApiProperty({ required: false, default: '6' })
  @IsOptional()
  // @IsNumber({}, { message: errorMessages.common.invalidPerPage })
  perPage: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  popular?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  myTopics?: boolean;

  @ApiHideProperty()
  user?: any;
}
