import CoordinatesDto from '../dto/coordinates.dto';
import { StateDto } from '../dto/state.dto';
import { MilitaryStatus, MilitaryBenefit, CumulativePostNineElevenService, CompletedEnlishment } from '../../learners/learner.model';

export interface LearnerUpdate {
  phoneNumber?: string;
  emailAddress?: string;
  $addToSet?: any;
  $pull?: any;
  fullname?: any;
  firstname?: string;
  lastname?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  zip?: string;
  state?: StateDto;
  city?: string;
  country?: string;
  coordinates?: CoordinatesDto;
  veteranBenefits?: boolean;
  militaryStatus?: MilitaryStatus;
  isSpouseActive?: boolean;
  militaryBenefit?: MilitaryBenefit;
  cumulativePostNineElevenService?: CumulativePostNineElevenService;
  completedEnlishment?: CompletedEnlishment;
  isEligiblePostNineElevenBill?: boolean;
  dependentCount?: number;
  wioaBenefits?: boolean;
}