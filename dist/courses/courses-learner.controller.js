"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const courses_service_1 = require("./courses.service");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const ResponseHandler_1 = require("../common/ResponseHandler");
const learnersCoursesList_dto_1 = require("./dto/learnersCoursesList.dto");
const courseIds_dto_1 = require("./dto/courseIds.dto");
const courseId_dto_1 = require("../common/dto/courseId.dto");
const postReview_dto_1 = require("./dto/postReview.dto");
const activities_service_1 = require("../activities/activities.service");
const enrollments_service_1 = require("../enrollments/enrollments.service");
const responseMessages_1 = require("../config/responseMessages");
const moment = require("moment");
const reviewId_dto_1 = require("../common/dto/reviewId.dto");
const courses_model_1 = require("./courses.model");
const courseNumId_dto_1 = require("../common/dto/courseNumId.dto");
const learners_service_1 = require("../learners/learners.service");
const enrollmentStatus_enum_1 = require("../common/enums/enrollmentStatus.enum");
const keyword_dto_1 = require("../common/dto/keyword.dto");
const checkPromo_dto_1 = require("./dto/checkPromo.dto");
const enquiries_service_1 = require("../enquiries/enquiries.service");
const addToCart_dto_1 = require("./dto/addToCart.dto");
const getCourseTaxLearner_dto_1 = require("./dto/getCourseTaxLearner.dto");
const college_model_1 = require("../colleges/college.model");
const colleges_service_1 = require("../colleges/colleges.service");
let CoursesLearnerController = class CoursesLearnerController {
    constructor(coursesService, activitiesService, enrollmentsService, learnersService, enquiriesService, collegesService) {
        this.coursesService = coursesService;
        this.activitiesService = activitiesService;
        this.enrollmentsService = enrollmentsService;
        this.learnersService = learnersService;
        this.enquiriesService = enquiriesService;
        this.collegesService = collegesService;
    }
    async CheckPromoValidity(checkPromoDto, learner) {
        checkPromoDto.learnerId = learner._id;
        checkPromoDto.cart = learner.cart && learner.cart.length > 0 ? learner.cart : [];
        return await this.coursesService.checkPromo(checkPromoDto);
    }
    async RemovePromoFromCart(courseIdDto, learner) {
        return await this.coursesService.removePromo(courseIdDto.courseId, learner._id);
    }
    async GetOccupations(keywordDto) {
        return await this.coursesService.getOccupationsForFilter(keywordDto.keyword ? keywordDto.keyword : '');
    }
    async GetSkills(keywordDto) {
        return await this.coursesService.getSkillsForFilter(keywordDto.keyword ? keywordDto.keyword : '');
    }
    async GetKnowledgeOutcomes(keywordDto) {
        return await this.coursesService.getKnowledgeOutcomesForFilter(keywordDto.keyword ? keywordDto.keyword : '');
    }
    async GetExperiences(keywordDto) {
        return await this.coursesService.getExperiencesForFilter(keywordDto.keyword ? keywordDto.keyword : '');
    }
    async GetRatingCategories() {
        return await this.coursesService.getRatingCategories();
    }
    async GetCoursesList(learnersCoursesListDto, req) {
        learnersCoursesListDto.keyword = learnersCoursesListDto.keyword ? learnersCoursesListDto.keyword : '';
        learnersCoursesListDto.page = Number(learnersCoursesListDto.page) ? Number(learnersCoursesListDto.page) : 1;
        learnersCoursesListDto.perPage = Number(learnersCoursesListDto.perPage) ? Number(learnersCoursesListDto.perPage) : 6;
        learnersCoursesListDto.lat = Number(learnersCoursesListDto.lat) ? Number(learnersCoursesListDto.lat) : null;
        learnersCoursesListDto.lng = Number(learnersCoursesListDto.lng) ? Number(learnersCoursesListDto.lng) : null;
        learnersCoursesListDto.minPrice = Number(learnersCoursesListDto.minPrice) ? Number(learnersCoursesListDto.minPrice) : null;
        learnersCoursesListDto.maxPrice = Number(learnersCoursesListDto.maxPrice) ? Number(learnersCoursesListDto.maxPrice) : null;
        learnersCoursesListDto.rating = learnersCoursesListDto.rating ? Number(learnersCoursesListDto.rating) : null;
        learnersCoursesListDto.startDate = learnersCoursesListDto.startDate ? learnersCoursesListDto.startDate : '';
        learnersCoursesListDto.endDate = learnersCoursesListDto.endDate ? learnersCoursesListDto.endDate : '';
        learnersCoursesListDto.courseType = learnersCoursesListDto.courseType ? learnersCoursesListDto.courseType : null;
        learnersCoursesListDto.relatedCredentials = learnersCoursesListDto.relatedCredentials
            ? learnersCoursesListDto.relatedCredentials
            : null;
        learnersCoursesListDto.funding = learnersCoursesListDto.funding ? learnersCoursesListDto.funding : null;
        learnersCoursesListDto.colleges = learnersCoursesListDto.colleges ? learnersCoursesListDto.colleges : null;
        learnersCoursesListDto.collegeId = learnersCoursesListDto.collegeId ? learnersCoursesListDto.collegeId : null;
        learnersCoursesListDto.employers = learnersCoursesListDto.employers ? learnersCoursesListDto.employers : null;
        learnersCoursesListDto.hoursOffered = learnersCoursesListDto.hoursOffered ? learnersCoursesListDto.hoursOffered : null;
        learnersCoursesListDto.categories = learnersCoursesListDto.categories ? learnersCoursesListDto.categories : null;
        learnersCoursesListDto.occupations = learnersCoursesListDto.occupations ? learnersCoursesListDto.occupations : null;
        learnersCoursesListDto.skillOutcomes = learnersCoursesListDto.skillOutcomes ? learnersCoursesListDto.skillOutcomes : null;
        learnersCoursesListDto.knowledgeOutcomes = learnersCoursesListDto.knowledgeOutcomes ? learnersCoursesListDto.knowledgeOutcomes : null;
        learnersCoursesListDto.experiences = learnersCoursesListDto.experiences ? learnersCoursesListDto.experiences : null;
        learnersCoursesListDto.minEnrollments = Number(learnersCoursesListDto.minEnrollments)
            ? Number(learnersCoursesListDto.minEnrollments)
            : null;
        learnersCoursesListDto.maxEnrollments = Number(learnersCoursesListDto.maxEnrollments)
            ? Number(learnersCoursesListDto.maxEnrollments)
            : null;
        learnersCoursesListDto.sort = learnersCoursesListDto.sort ? learnersCoursesListDto.sort : learnersCoursesList_dto_1.LearnerCourseListSortBy.Relevance;
        learnersCoursesListDto.credits = learnersCoursesListDto.credits ? learnersCoursesListDto.credits : false;
        learnersCoursesListDto.continuingCredits = learnersCoursesListDto.continuingCredits ? learnersCoursesListDto.continuingCredits : false;
        const learner = req.user ? await this.learnersService.getLearnerById(req.user._id) : null;
        const queryParams = req.url.split('?')[1] ? req.url.split('?')[1] : 'page=1&perPage=6';
        return await this.coursesService.getCoursesforLearners(learnersCoursesListDto, learner, queryParams);
    }
    async GetHighestPriceAndEnrollment() {
        return await this.coursesService.getHighestPriceAndEnrollmentSize();
    }
    async AddCoursesToCart(addToCartDto, user) {
        return await this.coursesService.addToCart(addToCartDto, user);
    }
    async AddCoursesToWishList(courseIdsDto, user) {
        return await this.coursesService.addToWishList(courseIdsDto.courses, user);
    }
    async AddCoursesToCheckoutList(courseIdsDto, user) {
        const courses = [];
        courseIdsDto.courses.forEach(courseId => {
            courses.push({ course: courseId });
        });
        return await this.coursesService.addToCheckoutList(courses, courseIdsDto.courses, user);
    }
    async AddCourseReview(postReviewDto, learner) {
        const course = await this.coursesService.getCourseById(postReviewDto.courseId);
        const instructorRatingId = await this.coursesService.getRatingCategoryIdbyIdentifier(courses_model_1.ratingCategories.teachingMethodology);
        if (!course) {
            ResponseHandler_1.default.fail(responseMessages_1.default.common.invalidCourseId);
        }
        if (!moment(course.date.end).isBefore(moment())) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.postReview.courseNotFinished);
        }
        const enrollment = await this.enrollmentsService.getLearnersCourseEnrollment(learner._id, course._id);
        if (!enrollment ||
            (enrollment.status !== enrollmentStatus_enum_1.EnrollmentStatus.APPROVED &&
                enrollment.status !== enrollmentStatus_enum_1.EnrollmentStatus.PROCESSED &&
                enrollment.status !== enrollmentStatus_enum_1.EnrollmentStatus.TRANSFERRED)) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.postReview.courseNotEnrolled);
        }
        if (course.reviews && course.reviews.length > 0) {
            if (course.reviews.find(elem => elem.learner.toString() === learner._id.toString())) {
                return ResponseHandler_1.default.fail(responseMessages_1.default.postReview.alreadyReviewed);
            }
        }
        const avgRating = postReviewDto.ratings.reduce((a, b) => a + b.value, 0) / postReviewDto.ratings.length;
        const currentInstructorRating = postReviewDto.ratings.find(ratingObj => ratingObj.category.toString() === instructorRatingId.toString())
            .value;
        const review = {
            learner: learner._id,
            review: postReviewDto.review,
            avgRating,
            ratings: postReviewDto.ratings,
        };
        let rating = 0;
        let instructorRating = 0;
        if (course.reviews && course.reviews.length > 0) {
            course.reviews.push(review);
            rating = (avgRating + course.rating * (course.reviews.length - 1)) / course.reviews.length;
            instructorRating = (currentInstructorRating + course.instructorRating * (course.reviews.length - 1)) / course.reviews.length;
        }
        else {
            course.reviews = [review];
            rating = avgRating;
            instructorRating = currentInstructorRating;
        }
        course.rating = rating;
        course.instructorRating = instructorRating;
        const updatedCourse = await course.save();
        return ResponseHandler_1.default.success({ updatedCourse });
    }
    async GetReviewById(reviewIdDto) {
        return await this.coursesService.getReviewById(reviewIdDto.reviewId);
    }
    async getCourseTax(getCourseTaxLearnerDto, learner) {
        const course = await this.coursesService.getCourseById(getCourseTaxLearnerDto.courseId);
        const learnerObj = await this.learnersService.getLearnerById(learner._id);
        return await this.coursesService.getTaxForLearner(course, learnerObj);
    }
    async GetCourseDetails(courseIdDto, req) {
        const [course, enrollmentsCount, ratings] = await Promise.all([
            this.coursesService.getCourseDetails(courseIdDto.courseId),
            this.enrollmentsService.getCourseEnrollmentsCount(courseIdDto.courseId),
            this.coursesService.getRatingsById(courseIdDto.courseId, true),
        ]);
        !course ? ResponseHandler_1.default.fail(responseMessages_1.default.common.invalidCourseId, null, 404) : null;
        course.isReviewed = false;
        if (req.user && course.reviews && course.reviews.length > 0) {
            if (course.reviews.find(elem => elem.learner._id.toString() === req.user._id.toString())) {
                course.isReviewed = true;
            }
        }
        course.reviewsCount = course.reviews.length;
        course.reviews.splice(2);
        if (course.time && course.time[0]) {
            course.time[0].hours = moment(course.time[0].end).diff(moment(course.time[0].start), 'hours');
        }
        let prevRatings = null;
        if (course && course.reviews.length < 1 && course.followUpCourseId && course.followUpCourseId._id) {
            prevRatings = await this.coursesService.getRatingsById(course.followUpCourseId.numId, true);
            course.followUpCourseId.reviewsCount = course.followUpCourseId.reviews.length;
            course.followUpCourseId.reviews.splice(2);
        }
        let enrollmentStatus = null;
        let enrollmentId = null;
        course.availableSlots = course.enrollmentsAllowed - enrollmentsCount;
        course.coursePrice = course.price + (course.collegeId.unmudlShare / 100) * course.price;
        course.totalPrice = course.coursePrice;
        delete course.price;
        const instructorRating = course.instructorIds[0] ? await this.coursesService.getInstructorRatings(course.instructorIds[0]._id) : null;
        course.instructor = course.instructorIds[0];
        delete course.instructorIds;
        if (course.instructor) {
            course.instructor.rating = instructorRating ? instructorRating.rating : null;
            course.instructor.reviewsCount = instructorRating ? instructorRating.reviewsCount : 0;
        }
        if (req.user) {
            const [learnersEnrollments, learner, enquiry] = await Promise.all([
                this.enrollmentsService.getLearnersCourseEnrollment(req.user._id, course._id),
                this.learnersService.getLearnerByEmail(req.user.emailAddress),
                this.enquiriesService.getLearnersEnquiry(req.user._id, course._id),
            ]);
            enrollmentStatus = learnersEnrollments ? learnersEnrollments.status : null;
            enrollmentId = learnersEnrollments ? learnersEnrollments._id : null;
            course.isInCart = learner.cart.some(cart => cart.course.toString() === course._id.toString());
            course.isInWishList = learner.wishList.some(wishList => wishList.course.toString() === course._id.toString());
            course.enquiry = enquiry ? enquiry._id : null;
        }
        course.enrollmentStatus = enrollmentStatus;
        course.enrollmentId = enrollmentId;
        course.ratingDetails = prevRatings ? prevRatings : ratings;
        course.college = course.collegeId;
        delete course.collegeId;
        if (!course.timeZone && !course.college.timeZone) {
            course.timeZone = college_model_1.defaultCollegeTimeZone;
            this.coursesService.updateCourseTimeZone(course._id, college_model_1.defaultCollegeTimeZone);
            this.collegesService.updateCollegeTimeZone(course.college._id, college_model_1.defaultCollegeTimeZone);
        }
        else if (!course.timeZone) {
            college_model_1.defaultCollegeTimeZones.forEach(timeZone => {
                if (timeZone.label === course.college.timeZone.label) {
                    course.timeZone = timeZone;
                    this.coursesService.updateCourseTimeZone(course._id, timeZone);
                }
            });
        }
        else if (!course.college.timeZone) {
            this.collegesService.updateCollegeTimeZone(course.college._id, college_model_1.defaultCollegeTimeZone);
        }
        else {
            if (!course.college.timeZone.shortForm) {
                college_model_1.defaultCollegeTimeZones.forEach(timeZone => {
                    if (timeZone.label === course.college.timeZone.label) {
                        this.collegesService.updateCollegeTimeZone(course.college._id, timeZone);
                    }
                });
            }
            if (!course.timeZone.shortForm) {
                college_model_1.defaultCollegeTimeZones.forEach(timeZone => {
                    if (timeZone.label === course.timeZone.label) {
                        course.timeZone = timeZone;
                        this.coursesService.updateCourseTimeZone(course._id, timeZone);
                    }
                });
            }
        }
        if (req.user) {
            try {
                const learner = await this.learnersService.getLearnerById(req.user._id);
                const response = await this.coursesService.getTaxForLearner(course, learner);
                const salesTax = response.data ? response.data : 0;
                course.salesTax = salesTax.toFixed(2);
                course.totalPriceWithTax = course.coursePrice + (salesTax / 100) * course.coursePrice;
            }
            catch (e) {
                course.salesTax = 0;
                course.totalPriceWithTax = course.coursePrice;
                return ResponseHandler_1.default.success({
                    course,
                }, e.response.message);
            }
        }
        return course
            ? ResponseHandler_1.default.success({
                course,
            })
            : ResponseHandler_1.default.fail(responseMessages_1.default.common.invalidCourseId, null, 404);
    }
};
__decorate([
    swagger_1.ApiOperation({ summary: 'Check validity and discount of a promo.' }),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    common_1.Get('applyPromo'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [checkPromo_dto_1.CheckPromoDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesLearnerController.prototype, "CheckPromoValidity", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Check validity and discount of a promo.' }),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    common_1.Post('removePromo'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [courseId_dto_1.CourseIdDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesLearnerController.prototype, "RemovePromoFromCart", null);
__decorate([
    swagger_1.ApiOperation({ description: 'get occupations for filter.' }),
    common_1.Get('occupations'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [keyword_dto_1.KeywordDto]),
    __metadata("design:returntype", Promise)
], CoursesLearnerController.prototype, "GetOccupations", null);
__decorate([
    swagger_1.ApiOperation({ description: 'get skills for filter.' }),
    common_1.Get('skills'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [keyword_dto_1.KeywordDto]),
    __metadata("design:returntype", Promise)
], CoursesLearnerController.prototype, "GetSkills", null);
__decorate([
    swagger_1.ApiOperation({ description: 'get knowledgeOutcomes for filter.' }),
    common_1.Get('knowledgeOutcomes'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [keyword_dto_1.KeywordDto]),
    __metadata("design:returntype", Promise)
], CoursesLearnerController.prototype, "GetKnowledgeOutcomes", null);
__decorate([
    swagger_1.ApiOperation({ description: 'get experiences for filter.' }),
    common_1.Get('experiences'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [keyword_dto_1.KeywordDto]),
    __metadata("design:returntype", Promise)
], CoursesLearnerController.prototype, "GetExperiences", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get rating categories' }),
    common_1.Get('ratingCategories'),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CoursesLearnerController.prototype, "GetRatingCategories", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get paginated list of courses.' }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, common_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [learnersCoursesList_dto_1.LearnersCoursesListDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesLearnerController.prototype, "GetCoursesList", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get highest course price and enrollment size.' }),
    common_1.Get('filter/values'),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CoursesLearnerController.prototype, "GetHighestPriceAndEnrollment", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Add courses to learners cart.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('addToCart'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [addToCart_dto_1.AddToCartDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesLearnerController.prototype, "AddCoursesToCart", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Add courses to learners wishlist(bookmark).' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('addToWishList'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [courseIds_dto_1.CourseIdsDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesLearnerController.prototype, "AddCoursesToWishList", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Add courses to learners checkoutList.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('addToCheckout'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [courseIds_dto_1.CourseIdsDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesLearnerController.prototype, "AddCoursesToCheckoutList", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Give course a review.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('addReview'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [postReview_dto_1.PostReviewDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesLearnerController.prototype, "AddCourseReview", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get paginated list of courses.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    common_1.Get('reviews/:reviewId'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reviewId_dto_1.ReviewIdDto]),
    __metadata("design:returntype", Promise)
], CoursesLearnerController.prototype, "GetReviewById", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get tax to be paid by a learner for a course.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    common_1.Get('tax'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getCourseTaxLearner_dto_1.GetCourseTaxLearnerDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesLearnerController.prototype, "getCourseTax", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get course details.' }),
    common_1.Get('/:courseId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, common_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [courseNumId_dto_1.CourseNumIdDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesLearnerController.prototype, "GetCourseDetails", null);
CoursesLearnerController = __decorate([
    swagger_1.ApiTags('Courses(Learner)'),
    common_1.Controller('/learners/courses'),
    __metadata("design:paramtypes", [courses_service_1.CoursesService,
        activities_service_1.ActivitiesService,
        enrollments_service_1.EnrollmentsService,
        learners_service_1.LearnersService,
        enquiries_service_1.EnquiriesService,
        colleges_service_1.CollegesService])
], CoursesLearnerController);
exports.CoursesLearnerController = CoursesLearnerController;
//# sourceMappingURL=courses-learner.controller.js.map