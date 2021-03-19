import { IsString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { RatingDto } from './rating.dto';
import responseMessages from '../../config/responseMessages';
import { IsArray, IsMongoId } from '../../common/validators';

export class PostReviewDto {
  @IsMongoId(false, { message: responseMessages.common.invalidCourseId })
  courseId: string;

  @IsArray(true)
  @ValidateNested({ each: true })
  @Type(() => RatingDto)
  @IsOptional()
  ratings?: RatingDto[];

  @IsString()
  @IsOptional()
  review?: string;
}
