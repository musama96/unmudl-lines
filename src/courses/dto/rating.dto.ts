import { IsNumber, Min, Max } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class RatingDto {
  @IsMongoId(false, { message: responseMessages.common.invalidCategoryId })
  category: string;

  // @IsNumber()
  // @Min(1)
  // @Max(5)
  value: number;
}
