import { IsString, IsBoolean } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { IsArray, IsMongoId } from '../../common/validators';

export class UpdateLandingFeaturedCoursesDto {
  @IsArray(false, { message: responseMessages.updateLanding.featured })
  @IsMongoId(false, { message: responseMessages.updateLanding.featured, each: true })
  featured: string[];

  @IsString()
  featuredTitle: string;

  @IsString()
  featuredDescription: string;

  @IsBoolean()
  hideFeatured: boolean;
}
