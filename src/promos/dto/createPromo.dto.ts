import { DurationDto } from '../../common/dto/duration.dto';
import { IsEnum, IsNumber, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import responseMessages from '../../config/responseMessages';
import { ApiHideProperty } from '@nestjs/swagger';
import { ApplyTo, DiscountCut, DiscountMetric } from '../../common/enums/createPromo.enum';
import { IsMongoId, IsArray } from '../../common/validators';

export class CreatePromoDto {
  @IsString({ message: responseMessages.createPromo.invalidPromo })
  title: string;

  // @IsDateString({message: responseMessages.common.invalidExpiryDate})
  // expiryDate: string;

  // @IsNumber({}, { message: responseMessages.createPromo.invalidPromoDiscount })
  // @Min(0, { message: responseMessages.createPromo.invalidPromoDiscount })
  // @Max(100, { message: responseMessages.createPromo.invalidPromoDiscount })
  discount: number;

  @IsEnum(DiscountMetric, { message: responseMessages.createPromo.discountMetric })
  discountMetric: DiscountMetric;

  @ValidateNested()
  @Type(() => DurationDto)
  date: DurationDto;

  @IsEnum(ApplyTo, { message: responseMessages.createPromo.applyTo })
  applyTo?: ApplyTo;

  @IsEnum(DiscountCut, { message: responseMessages.createPromo.type })
  type?: DiscountCut;

  @ApiHideProperty()
  status?: string;

  @ApiHideProperty()
  addedBy?: string;

  @ApiHideProperty()
  addedByLearner?: string;

  @IsArray(true, { message: responseMessages.common.invalidCourseIds })
  @IsMongoId(true, { message: responseMessages.common.invalidCourseIds, each: true })
  courses?: string[];

  @IsMongoId(true, { message: responseMessages.common.invalidCollegeId })
  collegeId?: string;

  // @IsOptional()
  // @IsArray()
  // @IsMongoId({message: responseMessages.common.invalidCollegeId, each: true})
  // colleges?: string[];
}
