import CoordinatesDto from '../../common/dto/coordinates.dto';
import { StateDto } from '../../common/dto/state.dto';
import { Gender, MilitaryStatus, MilitaryBenefit } from '../../learners/learner.model';
export declare class LearnerDataDto {
    firstname?: string;
    lastname?: string;
    emailAddress?: string;
    phoneNumber?: string;
    address?: string;
    dateOfBirth?: string;
    hasStudentId?: boolean;
    studentId?: string;
    coordinates?: CoordinatesDto;
    city?: string;
    state?: StateDto;
    country?: string;
    zip?: string;
    fullname?: string;
    gender?: Gender;
    veteranBenefits?: boolean;
    militaryStatus?: MilitaryStatus;
    isSpouseActive?: boolean;
    militaryBenefit?: MilitaryBenefit;
    wioaBenefits?: boolean;
}
