import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, Min} from 'class-validator';
import responseMessages from '../../config/responseMessages';

export class BugReportsListDto {
  keyword?: string;

  @ApiProperty({default: 1})
  // @IsNumber({}, {message: responseMessages.common.invalidPage})
  // @Min(1, {message: responseMessages.common.invalidPage})
  page: number;

  @ApiProperty({default: 10})
  // @IsNumber({}, {message: responseMessages.common.invalidPerPage})
  // @Min(1, {message: responseMessages.common.invalidPerPage})
  perPage: number;
}
