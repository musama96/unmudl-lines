import { Ethnicity, Gender, MilitaryStatus, MilitaryBenefit } from '../learner.model';
export declare class EditPersonalInformationDto {
    firstname: string;
    lastname: string;
    fullname?: string;
    ethnicity?: Ethnicity;
    gender?: Gender;
    phoneNumber?: string;
    emailAddress?: string;
    dateOfBirth?: string;
    veteranBenefits?: boolean;
    militaryStatus?: MilitaryStatus;
    isSpouseActive?: boolean;
    militaryBenefit?: MilitaryBenefit;
    wioaBenefits?: boolean;
}
