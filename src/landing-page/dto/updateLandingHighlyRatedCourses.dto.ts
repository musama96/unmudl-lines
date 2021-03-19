import { IsString, IsBoolean } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { IsArray, IsMongoId } from '../../common/validators';

export class UpdateLandingHighlyRatedCoursesDto {
  @IsArray(false, { message: responseMessages.updateLanding.highlyRated })
  @IsMongoId(false, { message: responseMessages.updateLanding.highlyRated, each: true })
  highlyRated: string[];

  @IsString()
  highlyRatedTitle: string;

  @IsString()
  highlyRatedDescription: string;

  @IsBoolean()
  hideHighlyRated: boolean;
}
