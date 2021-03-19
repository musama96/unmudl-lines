import * as mongoose from 'mongoose';
export declare enum Ethnicity {
    AMERICAN_INDIAN = "American Indian or Alaska Native",
    ASIAN = "Asian",
    AFRICAN_AMERICAN = "Black or African American",
    NATIVE_HAWAIIAN = "Native Hawaiian or Other Pacific Islander",
    WHITE = "White",
    HISPANIC = "Hispanic or Latino",
    NOT_HISPANIC = "Not Hispanic or Latino",
    PREFER_NOT_TO_RESPOND = "Prefer not to respond"
}
export declare enum PrimarySignup {
    EMAIL_ADDRESS = "emailAddress",
    PHONE_NUMBER = "phoneNumber"
}
export declare enum Gender {
    MALE = "Male",
    FEMALE = "Female",
    INTERSEX = "Intersex",
    TRANSGENDER = "Transgender",
    NON_BINARY = "Non-binary",
    PREFER_NOT_TO_RESPOND = "Prefer not to respond"
}
export declare enum MilitaryStatus {
    VETERAN = "Veteran",
    ACTIVE_DUTY = "Active Duty",
    NATIONAL_GUARD_RESERVES = "National Guard / Reserves",
    SPOUSE = "Spouse / Domestic Partner",
    CHILD = "Child",
    OTHER = "Other - DOD, Federal Government"
}
export declare enum MilitaryBenefit {
    GI_BILL = "GI Bill [Post 9/11 CH 33, Montgomery CH 30, Select Reserve CH 1606]",
    TUITION_REIMBURSEMENT = "Tuition Reimbursement from Military",
    ARMY_CREDENTIAL = "Army Credential Assistance Program",
    GOVERNMENT_EDUCATION_BENEFITS = "Federal Government Education Benefits",
    VETERAN_READINESS = "Veteran Readiness and Employment",
    DEA = "Dependent Educational Assistance (DEA)",
    OTHER = "Other: like scholarships or awards",
    NONE = "None"
}
export declare enum CumulativePostNineElevenService {
    THIRTY_SIX_PLUS = "36+ months: 100%",
    THIRTY_MONTHS = "30 months: 90%",
    TWENTY_FOUR_MONTHS = "24 months: 80%",
    EIGHTEEN_MONTHS = "18 months: 70%",
    SIX_MONTHS = "6 months: 60%",
    NINETY_DAYS = "90 days: 50%",
    GYGST_FRY = "GYGST Fry Scholarship: 100%",
    SERVICE_CONNECTED_DISCHARGE = "Service-Connected Discharge: 100%",
    PURPLE_HEART_SERVICE = "Purple Heart Service: 100%"
}
export declare enum CompletedEnlishment {
    THREE_OR_MORE = "3 or more years",
    TWO_OR_MORE = "2 or more years"
}
export declare const LearnerSchema: mongoose.Schema<any>;
export interface Learner extends mongoose.Document {
    firstname: string;
    lastname: string;
    emailAddress?: string;
    phoneNumber?: string;
    password?: string;
    stripeCustomerId?: string;
    primarySignup?: string;
}
