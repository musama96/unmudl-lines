import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApplyTo, DiscountCut } from '../../common/enums/createPromo.enum';
import { IsMongoId } from '../../common/validators';

export class PromoListDto {
  @ApiProperty({ required: false, default: '' })
  @IsOptional()
  @IsString({ message: responseMessages.common.invalidKeyword })
  keyword: string;

  @ApiProperty({ required: false, default: '' })
  @IsOptional()
  @IsString({ message: responseMessages.common.invalidKeyword })
  courseKeyword: string;

  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPage })
  page: number;

  @ApiProperty({ required: false, default: '10' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPerPage })
  perPage: number;

  @ApiProperty({ required: false, default: '' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidNoOfUses })
  // @Min(0, { message: responseMessages.common.invalidNoOfUses })
  noOfUses: number;

  @ApiProperty({ required: false, default: '' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidDiscount })
  // @Min(0, { message: responseMessages.common.invalidDiscount })
  minDiscount: number;

  @ApiProperty({ required: false, default: '' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidDiscount })
  // @Min(0, { message: responseMessages.common.invalidDiscount })
  maxDiscount: number;

  @IsOptional()
  @IsEnum(DiscountCut, { message: responseMessages.createPromo.type })
  type?: DiscountCut;

  @IsOptional()
  @IsEnum(ApplyTo, { message: responseMessages.createPromo.applyTo })
  applyTo?: ApplyTo;

  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidStartDate })
  start?: string;

  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidEndDate })
  end?: string;

  // @IsOptional()
  // @IsDateString({message: responseMessages.common.invalidExpiryDate})
  // expiryDate?: string;

  sortOrder?: string;
  sortBy?: string;
  discountType?: string;
  status?: string;

  @ApiProperty({ required: false, default: '' })
  @IsMongoId(true, { message: responseMessages.common.invalidCollegeId })
  collegeId?: string;

  @ApiProperty({ required: false, default: '' })
  @IsMongoId(true, { message: responseMessages.common.invalidCourseId })
  courseId?: string;
}
