import {IsEnum, IsIn, IsNumber, IsOptional, IsString, IsMongoId} from 'class-validator';
import responseMessages from '../../config/responseMessages';
import {ApiProperty} from '@nestjs/swagger';

export class  LearnerBlogsListDto {
  @IsOptional()
  @IsString({message: responseMessages.common.invalidKeyword})
  keyword?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPage })
  page?: number;

  @ApiProperty({ required: false, default: '10' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPerPage })
  perPage?: number;
}
