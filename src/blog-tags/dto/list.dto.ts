import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsOptional, IsString} from 'class-validator';
import responseMessages from '../../config/responseMessages';

export class ListDto {
  @ApiProperty({ required: false, default: '' })
  keyword?: string;

  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPage })
  page?: number;

  @ApiProperty({ required: false, default: '10' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPerPage })
  perPage?: number;
}
