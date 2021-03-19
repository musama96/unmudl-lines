import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../validators/isMongoId.validator';

export class ContactCollegeProposalResponseIdDto {
  @IsMongoId(false, { message: responseMessages.common.invalidProposalResponseId })
  id: string;
}
