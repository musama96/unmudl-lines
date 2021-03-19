import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

enum RefundRequestsColumn {
  LearnerName = 'learnerName',
  CourseName = 'courseName',
  Price = 'price',
  RequestDate = 'requestDate',
  EnrollmentDeadline = 'enrollmentDeadline',
  Status = 'status',
  DateResolved = 'dateResolved',
}

export class RefundRequestListDto {
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

  @ApiHideProperty()
  @IsMongoId(true)
  collegeId?: string;
}
