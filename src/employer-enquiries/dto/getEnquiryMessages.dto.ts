import { IsNumber, IsOptional } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class GetEnquiryMessagesDto {
  @ApiHideProperty()
  employerAdminId?: string;

  @ApiHideProperty()
  userId?: string;

  @ApiHideProperty()
  isAdmin?: boolean;

  @ApiProperty({ required: false })
  @IsMongoId(false)
  enquiry: string;

  // @IsNumber()
  @IsOptional()
  page?: number;

  // @IsNumber()
  @IsOptional()
  perPage?: number;
}
