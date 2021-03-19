import { Days } from '../../common/enums/days.enum';
import { TIMEZONE } from '../../common/enums/timezone.enum';
declare enum ContactTime {
    MORNING = "morning",
    EVENING = "evening",
    AFTERNOON = "afternoon"
}
export declare class EmployerRequestDto {
    email: string;
    phoneNumber: string;
    contactPerson: string;
    employerName: string;
    location: string;
    totalEmployees?: number;
    additionalInformation?: string;
    contactTime: ContactTime;
    dayOfWeek: Days;
    timezone: TIMEZONE;
}
export {};
