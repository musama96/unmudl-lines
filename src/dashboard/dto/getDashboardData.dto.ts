import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

enum UserType {
  COLLEGE = 'college',
  UNMUDL = 'unmudl',
}

enum Filter {
  UNDERENROLLED = 'underenrolled',
  OVERENROLLED = 'overenrolled',
}

export class GetDashboardDataDto {
  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidStartDate })
  start?: string;

  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidEndDate })
  end?: string;

  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidStartDate })
  graphStart?: string;

  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidEndDate })
  graphEnd?: string;

  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPage })
  page: number;

  @ApiProperty({ required: false, default: '10' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPerPage })
  perPage: number;

  @ApiProperty({ description: 'true for highest, false for lowest grossing date' })
  @IsOptional()
  @IsBoolean({ message: responseMessages.common.invalidRevenueSort })
  sort?: boolean;

  @ApiProperty({ description: '1, 30 or 365' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidInterval })
  interval?: number;

  @ApiProperty()
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidRefundRate })
  refundRate?: number;

  @ApiProperty()
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidRejectionRate })
  rejectionRate?: number;

  @ApiProperty()
  @IsEnum(Filter, { message: responseMessages.common.invalidStatsFilter })
  filter?: Filter;

  @ApiProperty()
  @IsOptional()
  @IsEnum(UserType, { message: responseMessages.createPromo.type })
  type: UserType;

  @ApiProperty()
  @IsMongoId(true, { message: responseMessages.common.invalidCollegeId })
  collegeId?: string;

  @ApiHideProperty()
  isUnmudlAdmin?: boolean;

  @ApiHideProperty()
  userCollegeId?: string;
}
