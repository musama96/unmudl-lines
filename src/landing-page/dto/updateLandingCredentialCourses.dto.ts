import { IsString, IsBoolean } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { IsArray, IsMongoId } from '../../common/validators';

export class UpdateLandingCredentialCoursesDto {
  @IsArray(false, { message: responseMessages.updateLanding.featured })
  @IsMongoId(false, { message: responseMessages.updateLanding.featured, each: true })
  credentialCourses: string[];

  @IsString()
  credentialCoursesTitle: string;

  @IsString()
  credentialCoursesDescription: string;

  @IsBoolean()
  hideCredentialCourses: boolean;
}
