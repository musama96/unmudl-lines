import { IsOptional, IsNumber } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class GetMessagesDto {
  @ApiProperty()
  @IsMongoId(false)
  chatId: string;

  // @IsNumber()
  @IsOptional()
  page?: number;

  // @IsNumber()
  @IsOptional()
  perPage?: number;

  @ApiHideProperty()
  userId?: string;
}
