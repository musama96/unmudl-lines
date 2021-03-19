import { ApiHideProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, ValidateNested } from 'class-validator';
import { DurationDto } from '../../common/dto/duration.dto';
import { ApplyTo, PromoDuration } from '../../common/enums/createPromo.enum';
import responseMessages from '../../config/responseMessages';

export class CreateEmployerSubscriptionPromoDto {
  @IsNotEmpty({ message: responseMessages.createPromo.invalidPromo })
  title?: string;

  percentage?: number;

  maxUses?: number;

  @ValidateNested()
  @Type(() => DurationDto)
  date?: DurationDto;

  @IsEnum(ApplyTo, { message: responseMessages.createPromo.applyTo })
  applyToPlans?: ApplyTo;

  @IsEnum(PromoDuration, { message: responseMessages.createPromo.applyTo })
  duration?: PromoDuration;

  plans?: string[];

  @ApiHideProperty()
  status?: string;

  @ApiHideProperty()
  addedBy?: string;

  @ApiHideProperty()
  stripeTitle?: string;
}
