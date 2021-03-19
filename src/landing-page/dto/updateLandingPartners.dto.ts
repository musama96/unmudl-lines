import responseMessages from '../../config/responseMessages';
import { IsArray, IsMongoId } from '../../common/validators';

export class UpdateLandingPartnersDto {
  @IsArray(false, { message: responseMessages.updateLanding.partners })
  @IsMongoId(false, { message: responseMessages.updateLanding.partners, each: true })
  partners: string[];
}
