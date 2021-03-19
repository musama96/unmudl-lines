"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
var Ethnicity;
(function (Ethnicity) {
    Ethnicity["AMERICAN_INDIAN"] = "American Indian or Alaska Native";
    Ethnicity["ASIAN"] = "Asian";
    Ethnicity["AFRICAN_AMERICAN"] = "Black or African American";
    Ethnicity["NATIVE_HAWAIIAN"] = "Native Hawaiian or Other Pacific Islander";
    Ethnicity["WHITE"] = "White";
    Ethnicity["HISPANIC"] = "Hispanic or Latino";
    Ethnicity["NOT_HISPANIC"] = "Not Hispanic or Latino";
    Ethnicity["PREFER_NOT_TO_RESPOND"] = "Prefer not to respond";
})(Ethnicity = exports.Ethnicity || (exports.Ethnicity = {}));
var PrimarySignup;
(function (PrimarySignup) {
    PrimarySignup["EMAIL_ADDRESS"] = "emailAddress";
    PrimarySignup["PHONE_NUMBER"] = "phoneNumber";
})(PrimarySignup = exports.PrimarySignup || (exports.PrimarySignup = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "Male";
    Gender["FEMALE"] = "Female";
    Gender["INTERSEX"] = "Intersex";
    Gender["TRANSGENDER"] = "Transgender";
    Gender["NON_BINARY"] = "Non-binary";
    Gender["PREFER_NOT_TO_RESPOND"] = "Prefer not to respond";
})(Gender = exports.Gender || (exports.Gender = {}));
var MilitaryStatus;
(function (MilitaryStatus) {
    MilitaryStatus["VETERAN"] = "Veteran";
    MilitaryStatus["ACTIVE_DUTY"] = "Active Duty";
    MilitaryStatus["NATIONAL_GUARD_RESERVES"] = "National Guard / Reserves";
    MilitaryStatus["SPOUSE"] = "Spouse / Domestic Partner";
    MilitaryStatus["CHILD"] = "Child";
    MilitaryStatus["OTHER"] = "Other - DOD, Federal Government";
})(MilitaryStatus = exports.MilitaryStatus || (exports.MilitaryStatus = {}));
var MilitaryBenefit;
(function (MilitaryBenefit) {
    MilitaryBenefit["GI_BILL"] = "GI Bill [Post 9/11 CH 33, Montgomery CH 30, Select Reserve CH 1606]";
    MilitaryBenefit["TUITION_REIMBURSEMENT"] = "Tuition Reimbursement from Military";
    MilitaryBenefit["ARMY_CREDENTIAL"] = "Army Credential Assistance Program";
    MilitaryBenefit["GOVERNMENT_EDUCATION_BENEFITS"] = "Federal Government Education Benefits";
    MilitaryBenefit["VETERAN_READINESS"] = "Veteran Readiness and Employment";
    MilitaryBenefit["DEA"] = "Dependent Educational Assistance (DEA)";
    MilitaryBenefit["OTHER"] = "Other: like scholarships or awards";
    MilitaryBenefit["NONE"] = "None";
})(MilitaryBenefit = exports.MilitaryBenefit || (exports.MilitaryBenefit = {}));
var CumulativePostNineElevenService;
(function (CumulativePostNineElevenService) {
    CumulativePostNineElevenService["THIRTY_SIX_PLUS"] = "36+ months: 100%";
    CumulativePostNineElevenService["THIRTY_MONTHS"] = "30 months: 90%";
    CumulativePostNineElevenService["TWENTY_FOUR_MONTHS"] = "24 months: 80%";
    CumulativePostNineElevenService["EIGHTEEN_MONTHS"] = "18 months: 70%";
    CumulativePostNineElevenService["SIX_MONTHS"] = "6 months: 60%";
    CumulativePostNineElevenService["NINETY_DAYS"] = "90 days: 50%";
    CumulativePostNineElevenService["GYGST_FRY"] = "GYGST Fry Scholarship: 100%";
    CumulativePostNineElevenService["SERVICE_CONNECTED_DISCHARGE"] = "Service-Connected Discharge: 100%";
    CumulativePostNineElevenService["PURPLE_HEART_SERVICE"] = "Purple Heart Service: 100%";
})(CumulativePostNineElevenService = exports.CumulativePostNineElevenService || (exports.CumulativePostNineElevenService = {}));
var CompletedEnlishment;
(function (CompletedEnlishment) {
    CompletedEnlishment["THREE_OR_MORE"] = "3 or more years";
    CompletedEnlishment["TWO_OR_MORE"] = "2 or more years";
})(CompletedEnlishment = exports.CompletedEnlishment || (exports.CompletedEnlishment = {}));
exports.LearnerSchema = new mongoose.Schema({
    firstname: { type: String, required: true, trim: true },
    lastname: { type: String, required: true, trim: true },
    fullname: { type: String, required: true, trim: true },
    ethnicity: { type: String, default: Ethnicity.PREFER_NOT_TO_RESPOND },
    emailAddress: { type: String, lowercase: true, trim: true, default: null },
    phoneNumber: { type: String, default: null },
    primarySignup: { type: String, default: 'emailAddress' },
    dateOfBirth: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },
    hasPassword: { type: Boolean, default: true },
    password: { type: String, select: false },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'courses' }],
    cart: [{
            course: { type: mongoose.Schema.Types.ObjectId, ref: 'courses' },
            promo: { type: mongoose.Schema.Types.ObjectId, ref: 'promos' },
            dateAdded: { type: Date, default: Date.now },
            firstname: { type: String, default: null },
            lastname: { type: String, default: null },
            emailAddress: { type: String, default: null },
            phoneNumber: { type: String, default: null },
            address: { type: String, default: null },
            dateOfBirth: { type: Date, default: null },
            hasStudentId: { type: Boolean, default: null },
            studentId: { type: String, default: null },
            city: { type: String, required: false },
            state: {
                longName: { type: String },
                shortName: { type: String },
            },
            zip: { type: String, required: false },
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
            veteranBenefits: { type: Boolean, default: false },
            militaryStatus: { type: String, default: null },
            isSpouseActive: { type: Boolean, default: null },
            militaryBenefit: { type: String, default: null },
            wioaBenefits: { type: Boolean, default: false },
        }],
    veteranBenefits: { type: Boolean, default: false },
    militaryStatus: { type: String, default: null },
    isSpouseActive: { type: Boolean, default: null },
    militaryBenefit: { type: String, default: null },
    wioaBenefits: { type: Boolean, default: false },
    checkoutList: [{
            course: { type: mongoose.Schema.Types.ObjectId, ref: 'courses' },
            dateAdded: { type: Date, default: Date.now },
        }],
    wishList: [{
            course: { type: mongoose.Schema.Types.ObjectId, ref: 'courses' },
            dateAdded: { type: Date, default: Date.now },
        }],
    profilePhoto: { type: String, default: null },
    profilePhotoThumbnail: { type: String, default: null },
    address: { type: String, default: null },
    city: { type: String, default: null },
    state: {
        longName: { type: String, default: null },
        shortName: { type: String, default: null },
    },
    zip: { type: String, default: null },
    country: { type: String, default: null },
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
    gender: { type: String, default: Gender.PREFER_NOT_TO_RESPOND },
    totalRevenue: { type: Number, default: 0, select: false },
    unmudlRevenue: { type: Number, default: 0, select: false },
    collegeRevenue: { type: Number, default: 0, select: false },
    blacklisted: { type: Boolean, default: false },
    stripeCustomerId: { type: String, required: false, default: null },
    lastLoggedIn: { type: Date },
    isSuspended: { type: Boolean, default: false },
}, {
    timestamps: true,
});
exports.LearnerSchema.query.byCollege = function (collegeId) {
    if (collegeId) {
        return this.where({
            collegeId,
        });
    }
    else {
        return null;
    }
};
//# sourceMappingURL=learner.model.js.map