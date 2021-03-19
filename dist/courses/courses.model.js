"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
var HoursOffered;
(function (HoursOffered) {
    HoursOffered["DAYTIME"] = "daytime";
    HoursOffered["EVENING"] = "evening";
    HoursOffered["WEEKEND"] = "weekend";
    HoursOffered["FLEXIBLE"] = "flexibleOnline";
})(HoursOffered = exports.HoursOffered || (exports.HoursOffered = {}));
var Venue;
(function (Venue) {
    Venue["INPERSON"] = "inperson";
    Venue["ONLINE"] = "online";
    Venue["ONLINE_SCHEDULED"] = "onlineScheduled";
    Venue["BLENDED"] = "blended";
})(Venue = exports.Venue || (exports.Venue = {}));
var IntervalType;
(function (IntervalType) {
    IntervalType["DAY"] = "day";
    IntervalType["WEEK"] = "week";
    IntervalType["MONTH"] = "month";
})(IntervalType = exports.IntervalType || (exports.IntervalType = {}));
var Schedule;
(function (Schedule) {
    Schedule["DAILY"] = "daily";
    Schedule["WEEKDAYS"] = "weekdays";
    Schedule["CUSTOM"] = "custom";
})(Schedule = exports.Schedule || (exports.Schedule = {}));
var CourseStatus;
(function (CourseStatus) {
    CourseStatus["LIVE"] = "live";
    CourseStatus["COMING_SOON"] = "coming_soon";
    CourseStatus["UNPUBLISH"] = "unpublished";
    CourseStatus["CANCELED"] = "canceled";
})(CourseStatus = exports.CourseStatus || (exports.CourseStatus = {}));
var RelatedCredentials;
(function (RelatedCredentials) {
    RelatedCredentials["LICENSE"] = "License";
    RelatedCredentials["CERTIFICATE"] = "Certificate";
    RelatedCredentials["CERTIFICATION"] = "Certification";
    RelatedCredentials["ASSOCIATESDEGREE"] = "Associates Degree";
})(RelatedCredentials = exports.RelatedCredentials || (exports.RelatedCredentials = {}));
exports.CourseSchema = new mongoose.Schema({
    externalCourseId: { type: String, default: null },
    coverPhoto: { type: String },
    coverPhotoThumbnail: { type: String },
    title: { type: String, required: true },
    institutes: [
        {
            name: { type: String, required: true },
            website: { type: String, required: false },
        },
    ],
    altTag: { type: String },
    url: { type: String },
    isUnmudlOriginal: { type: Boolean, default: false },
    price: { type: Number, required: true },
    displayPrice: { type: Number, default: null },
    totalRevenue: { type: Number, default: 0, select: false },
    unmudlRevenue: { type: Number, default: 0, select: false },
    collegeRevenue: { type: Number, default: 0, select: false },
    tax: { type: Number, default: 0 },
    enrollmentsAllowed: { type: Number, required: true },
    enrollmentDeadline: { type: Date, required: true },
    enrollmentsCanceled: { type: Boolean, default: false },
    autoEnroll: { type: Boolean, default: false },
    instructorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    employers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'employers', required: false }],
    venue: { type: String, required: true },
    address: { type: String, required: false },
    city: { type: String, required: false },
    state: {
        longName: { type: String },
        shortName: { type: String },
    },
    zip: { type: String, required: false },
    country: String,
    coordinates: {
        type: {
            type: String,
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    followUpCourseId: { type: mongoose.Schema.Types.ObjectId, ref: 'courses' },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'colleges' },
    date: {
        start: { type: Date, required: false, default: null },
        end: { type: Date, required: false, default: null },
    },
    schedule: { type: String, required: false },
    time: [
        {
            hoursOffered: { type: String, required: false },
            start: { type: Date, required: false },
            end: { type: Date, required: false },
        },
    ],
    timeZone: {
        offset: { type: Number, default: 6 },
        shortForm: { type: String, default: 'CST' },
        label: { type: String, default: 'Central' },
        value: { type: String, default: 'America/Chicago' },
    },
    hoursOffered: [{ type: String, required: true }],
    hoursPerWeek: { type: Number, default: null },
    estimatedWeeks: { type: Number, default: null },
    customSchedule: {
        repeatInterval: { type: Number },
        intervalType: { type: String },
        endDate: { type: Date },
        weekdays: [{ type: Number }],
        occurences: { type: Number },
    },
    attendanceInformation: { type: String },
    description: { type: String, required: true },
    outline: { type: String, required: false },
    eligibilityRestrictions: { type: String, required: false },
    attachments: [{ type: String }],
    associateDegrees: [
        {
            CIPTitle: { type: String, required: true },
            CIPCode: { type: String, required: true },
            CIPDefinition: { type: String },
        },
    ],
    certificates: [
        {
            CIPTitle: { type: String, required: true },
            CIPCode: { type: String, required: true },
            CIPDefinition: { type: String },
        },
    ],
    certifications: [
        {
            Id: { type: String, required: true },
            Name: { type: String, required: true },
            Organization: { type: String, required: false },
            Description: { type: String, required: false },
        },
    ],
    licenses: [
        {
            ID: { type: String, required: true },
            Title: { type: String, required: true },
            Description: { type: String, required: false },
        },
    ],
    certificatesPath: [{ type: String, required: false }],
    relatedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'courses' }],
    unpublishedDate: { type: Date, required: false, default: null },
    unpublishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    rating: { type: Number, required: false },
    instructorRating: { type: Number, required: false },
    reviews: [
        {
            learner: { type: mongoose.Schema.Types.ObjectId, ref: 'learners' },
            review: { type: String, required: false },
            avgRating: { type: Number },
            ratings: [
                {
                    category: { type: mongoose.Schema.Types.ObjectId, ref: 'ratingCategories' },
                    value: { type: Number },
                },
            ],
            dateAdded: { type: Date, default: Date.now },
        },
    ],
    numId: { type: Number, unique: true },
    occupations: [
        {
            code: { type: String },
            title: { type: String },
        },
    ],
    knowledgeOutcomes: [
        {
            id: { type: String },
            name: { type: String },
            description: { type: String },
            level: { type: Number },
        },
    ],
    skillOutcomes: [
        {
            id: { type: String },
            name: { type: String },
            description: { type: String },
            level: { type: Number },
        },
    ],
    experiences: [
        {
            id: { type: String },
            name: { type: String },
            hours: { type: Number },
        },
    ],
    credits: { type: Number, required: false },
    continuingCredits: { type: Number, required: false },
    instructorDisplayName: { type: String, default: null },
    isDisplayPrice: { type: Boolean, default: false },
    status: { type: String, default: CourseStatus.LIVE },
    cancelReasons: [{ type: String }],
    canceledBy: { type: mongoose.Types.ObjectId, ref: 'users' },
    categories: [{ type: String }],
    categoryIds: [{ type: mongoose.Types.ObjectId, ref: 'course-categories' }],
    wioaFunds: { type: Boolean, default: false },
    veteranBenefits: { type: Boolean, default: false },
}, {
    timestamps: true,
});
exports.CourseSchema.query.byKeyword = function (keyword) {
    return this.where({
        title: {
            $regex: keyword,
            $options: 'i',
        },
    });
};
exports.CourseSchema.query.paginate = function (page, perPage) {
    return this.skip((page - 1) * perPage).limit(perPage);
};
var ratingCategories;
(function (ratingCategories) {
    ratingCategories["CourseMaterial"] = "courseMaterial";
    ratingCategories["CourseManagement"] = "courseManagement";
    ratingCategories["teachingMethodology"] = "teachingMethodology";
    ratingCategories["CourseOutcomes"] = "courseOutcomes";
    ratingCategories["OverallExperience"] = "overallExperience";
})(ratingCategories = exports.ratingCategories || (exports.ratingCategories = {}));
exports.RatingCategoriesSchema = new mongoose.Schema({
    text: { type: String },
    order: { type: Number },
    identifier: { type: String, unique: true },
}, {
    timestamps: true,
});
exports.TrashedCourseSchema = new mongoose.Schema({
    courseId: { type: mongoose.SchemaTypes.ObjectId, ref: 'courses' },
    externalCourseId: { type: String, default: null },
    coverPhoto: { type: String },
    coverPhotoThumbnail: { type: String },
    title: { type: String, required: true },
    institutes: [
        {
            name: { type: String, required: true },
            website: { type: String, required: false },
        },
    ],
    altTag: { type: String },
    url: { type: String },
    isUnmudlOriginal: { type: Boolean, default: false },
    price: { type: Number, required: true },
    totalRevenue: { type: Number, default: 0, select: false },
    unmudlRevenue: { type: Number, default: 0, select: false },
    collegeRevenue: { type: Number, default: 0, select: false },
    tax: { type: Number, default: 0 },
    enrollmentsAllowed: { type: Number, required: true },
    enrollmentDeadline: { type: Date, required: true },
    enrollmentsCanceled: { type: Boolean, default: false },
    autoEnroll: { type: Boolean, default: false },
    instructorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    employers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'employers', required: false }],
    venue: { type: String, required: true },
    address: { type: String, required: false },
    city: { type: String, required: false },
    state: {
        longName: { type: String },
        shortName: { type: String },
    },
    zip: { type: String, required: false },
    country: String,
    coordinates: {
        type: {
            type: String,
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    followUpCourseId: { type: mongoose.Schema.Types.ObjectId, ref: 'courses' },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'colleges' },
    date: {
        start: { type: Date, required: false, default: null },
        end: { type: Date, required: false, default: null },
    },
    schedule: { type: String, required: false },
    time: [
        {
            hoursOffered: { type: String, required: false },
            start: { type: Date, required: false },
            end: { type: Date, required: false },
        },
    ],
    hoursOffered: [{ type: String, required: true }],
    hoursPerWeek: { type: Number, default: null },
    estimatedWeeks: { type: Number, default: null },
    customSchedule: {
        repeatInterval: { type: Number },
        intervalType: { type: String },
        endDate: { type: Date },
        weekdays: [{ type: Number }],
        occurences: { type: Number },
    },
    attendanceInformation: { type: String },
    timeZone: {
        offset: { type: Number, default: 6 },
        shortForm: { type: String, default: 'CST' },
        label: { type: String, default: 'Central' },
        value: { type: String, default: 'America/Chicago' },
    },
    description: { type: String, required: true },
    outline: { type: String, required: false },
    eligibilityRestrictions: { type: String, required: false },
    attachments: [{ type: String }],
    associateDegrees: [
        {
            CIPTitle: { type: String, required: true },
            CIPCode: { type: String, required: true },
            CIPDefinition: { type: String },
        },
    ],
    certificates: [
        {
            CIPTitle: { type: String, required: true },
            CIPCode: { type: String, required: true },
            CIPDefinition: { type: String },
        },
    ],
    certifications: [
        {
            Id: { type: String, required: true },
            Name: { type: String, required: true },
            Organization: { type: String, required: false },
            Description: { type: String, required: false },
        },
    ],
    licenses: [
        {
            ID: { type: String, required: true },
            Title: { type: String, required: true },
            Description: { type: String, required: false },
        },
    ],
    certificatesPath: [{ type: String, required: false }],
    relatedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'courses' }],
    unpublishedDate: { type: Date, required: false, default: null },
    unpublishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    rating: { type: Number, required: false },
    instructorRating: { type: Number, required: false },
    reviews: [
        {
            learner: { type: mongoose.Schema.Types.ObjectId, ref: 'learners' },
            review: { type: String, required: false },
            avgRating: { type: Number },
            ratings: [
                {
                    category: { type: mongoose.Schema.Types.ObjectId, ref: 'ratingCategories' },
                    value: { type: Number },
                },
            ],
            dateAdded: { type: Date, default: Date.now },
        },
    ],
    numId: { type: Number, unique: true },
    occupations: [
        {
            code: { type: String },
            title: { type: String },
        },
    ],
    knowledgeOutcomes: [
        {
            id: { type: String },
            name: { type: String },
            description: { type: String },
            level: { type: Number },
        },
    ],
    skillOutcomes: [
        {
            id: { type: String },
            name: { type: String },
            description: { type: String },
            level: { type: Number },
        },
    ],
    experiences: [
        {
            id: { type: String },
            name: { type: String },
            hours: { type: Number },
        },
    ],
    credits: { type: Number, required: false },
    continuingCredits: { type: Number, required: false },
    instructorDisplayName: { type: String, default: null },
    status: { type: String, enum: ['live', 'coming-soon', 'canceled'], default: 'live' },
    cancelReasons: [{ type: String }],
    canceledBy: { type: mongoose.Types.ObjectId, ref: 'users' },
}, {
    timestamps: true,
});
//# sourceMappingURL=courses.model.js.map