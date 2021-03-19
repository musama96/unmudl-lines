import { IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import errorMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';
import responseMessages from '../../config/responseMessages';

export class RepliesListDto {
  @ApiProperty({ required: false, default: '4' })
  @IsOptional()
  // @IsNumber({}, { message: errorMessages.common.invalidPerPage })
  repliesPerPage?: number;

  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidStartDate })
  start?: string;

  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidEndDate })
  end?: string;

  @ApiHideProperty()
  postId?: string;

  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  // @IsNumber({}, { message: errorMessages.common.invalidPage })
  page: number;

  @ApiProperty({ required: false, default: '4' })
  @IsOptional()
  // @IsNumber({}, { message: errorMessages.common.invalidPerPage })
  perPage: number;

  // @ApiProperty({ required: false, default: '4' })
  // @IsOptional()
  // // @IsNumber({}, { message: errorMessages.common.invalidPerPage })
  // recentRepliesPerPage: number;
}
