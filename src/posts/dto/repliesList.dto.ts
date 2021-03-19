import { IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import errorMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class RepliesListDto {
  @ApiProperty({ description: 'numId of post' })
  // @IsNumber()
  numId: number;

  @ApiProperty({ required: false })
  @ApiHideProperty()
  @IsMongoId(true, { message: errorMessages.post.postId })
  postId?: string;

  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  // @IsNumber({}, { message: errorMessages.common.invalidPage })
  page: number;

  @ApiProperty({ required: false, default: '4' })
  @IsOptional()
  // @IsNumber({}, { message: errorMessages.common.invalidPerPage })
  perPage: number;

  @ApiProperty({ required: false, default: '4' })
  @IsOptional()
  // @IsNumber({}, { message: errorMessages.common.invalidPerPage })
  recentRepliesPerPage: number;
}
