import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { SortOrderEnum } from '../../common/enums/sort.enum';

enum PartnerRequestsColumn {
  ContactPerson = 'contactPerson',
  CollegeName = 'collegeName',
  Email = 'email',
  PhoneNumber = 'phoneNumber',
  Status = 'status',
}

export class PartnerRequestListDto {
  keyword?: string;

  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPage })
  page: number;

  @ApiProperty({ required: false, default: '10' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPerPage })
  perPage: number;

  sortBy?: string;
  sortOrder?: string;
}
