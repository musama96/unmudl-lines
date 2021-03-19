import * as mongoose from 'mongoose';
export declare enum HoursOffered {
    DAYTIME = "daytime",
    EVENING = "evening",
    WEEKEND = "weekend",
    FLEXIBLE = "flexibleOnline"
}
export declare enum Venue {
    INPERSON = "inperson",
    ONLINE = "online",
    ONLINE_SCHEDULED = "onlineScheduled",
    BLENDED = "blended"
}
export declare enum IntervalType {
    DAY = "day",
    WEEK = "week",
    MONTH = "month"
}
export declare enum Schedule {
    DAILY = "daily",
    WEEKDAYS = "weekdays",
    CUSTOM = "custom"
}
export declare enum CourseStatus {
    LIVE = "live",
    COMING_SOON = "coming_soon",
    UNPUBLISH = "unpublished",
    CANCELED = "canceled"
}
export declare enum RelatedCredentials {
    LICENSE = "License",
    CERTIFICATE = "Certificate",
    CERTIFICATION = "Certification",
    ASSOCIATESDEGREE = "Associates Degree"
}
export declare const CourseSchema: mongoose.Schema<any>;
export interface Course extends mongoose.Document {
    full_name: string;
    email_address: string;
    username: string;
    password: string;
}
export declare enum ratingCategories {
    CourseMaterial = "courseMaterial",
    CourseManagement = "courseManagement",
    teachingMethodology = "teachingMethodology",
    CourseOutcomes = "courseOutcomes",
    OverallExperience = "overallExperience"
}
export declare const RatingCategoriesSchema: mongoose.Schema<any>;
export declare const TrashedCourseSchema: mongoose.Schema<any>;
