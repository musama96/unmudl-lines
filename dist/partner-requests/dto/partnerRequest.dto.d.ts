import { Days } from '../../common/enums/days.enum';
import { TIMEZONE } from '../../common/enums/timezone.enum';
declare enum ContactTime {
    MORNING = "morning",
    EVENING = "evening",
    AFTERNOON = "afternoon"
}
export declare class PartnerRequestDto {
    email: string;
    phoneNumber: string;
    contactPerson: string;
    collegeName: string;
    location: string;
    totalEnrollments?: number;
    nonCreditCourses: boolean;
    additionalInformation?: string;
    contactTime: ContactTime;
    dayOfWeek: Days;
    timezone: TIMEZONE;
}
export {};
