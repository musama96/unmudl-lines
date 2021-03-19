import { Controller, Get, Body, UseGuards, Query, Post, Param, Req, HttpCode } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import { LearnersCoursesListDto, LearnerCourseListSortBy } from './dto/learnersCoursesList.dto';
import { CourseIdsDto } from './dto/courseIds.dto';
import { CourseIdDto } from '../common/dto/courseId.dto';
import { PostReviewDto } from './dto/postReview.dto';
import { ActivitiesService } from '../activities/activities.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import responseMessages from '../config/responseMessages';
import * as moment from 'moment';
import { ReviewIdDto } from '../common/dto/reviewId.dto';
import { ratingCategories } from './courses.model';
import { CourseNumIdDto } from '../common/dto/courseNumId.dto';
import { LearnersService } from '../learners/learners.service';
import { EnrollmentStatus } from '../common/enums/enrollmentStatus.enum';
import { KeywordDto } from '../common/dto/keyword.dto';
import { CheckPromoDto } from './dto/checkPromo.dto';
import { EnquiriesService } from '../enquiries/enquiries.service';
import { AddToCartDto } from './dto/addToCart.dto';
import { GetCourseTaxLearnerDto } from './dto/getCourseTaxLearner.dto';
import { defaultCollegeTimeZone, defaultCollegeTimeZones } from '../colleges/college.model';
import { CollegesService } from '../colleges/colleges.service';

@ApiTags('Courses(Learner)')
@Controller('/learners/courses')
export class CoursesLearnerController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly activitiesService: ActivitiesService,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly learnersService: LearnersService,
    private readonly enquiriesService: EnquiriesService,
    private readonly collegesService: CollegesService,
  ) {}

  @ApiOperation({ summary: 'Check validity and discount of a promo.' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('applyPromo')
  async CheckPromoValidity(@Query() checkPromoDto: CheckPromoDto, @GetUser() learner) {
    checkPromoDto.learnerId = learner._id;
    checkPromoDto.cart = learner.cart && learner.cart.length > 0 ? learner.cart : [];
    return await this.coursesService.checkPromo(checkPromoDto);
  }

  @ApiOperation({ summary: 'Check validity and discount of a promo.' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('removePromo')
  async RemovePromoFromCart(@Body() courseIdDto: CourseIdDto, @GetUser() learner) {
    return await this.coursesService.removePromo(courseIdDto.courseId, learner._id);
  }

  @ApiOperation({ description: 'get occupations for filter.' })
  @Get('occupations')
  async GetOccupations(@Query() keywordDto: KeywordDto) {
    return await this.coursesService.getOccupationsForFilter(keywordDto.keyword ? keywordDto.keyword : '');
  }

  @ApiOperation({ description: 'get skills for filter.' })
  @Get('skills')
  async GetSkills(@Query() keywordDto: KeywordDto) {
    return await this.coursesService.getSkillsForFilter(keywordDto.keyword ? keywordDto.keyword : '');
  }

  @ApiOperation({ description: 'get knowledgeOutcomes for filter.' })
  @Get('knowledgeOutcomes')
  async GetKnowledgeOutcomes(@Query() keywordDto: KeywordDto) {
    return await this.coursesService.getKnowledgeOutcomesForFilter(keywordDto.keyword ? keywordDto.keyword : '');
  }

  @ApiOperation({ description: 'get experiences for filter.' })
  @Get('experiences')
  async GetExperiences(@Query() keywordDto: KeywordDto) {
    return await this.coursesService.getExperiencesForFilter(keywordDto.keyword ? keywordDto.keyword : '');
  }

  @ApiOperation({ summary: 'Get rating categories' })
  @Get('ratingCategories')
  async GetRatingCategories() {
    return await this.coursesService.getRatingCategories();
  }

  @ApiOperation({ summary: 'Get paginated list of courses.' })
  @Get()
  async GetCoursesList(@Query() learnersCoursesListDto: LearnersCoursesListDto, @Req() req): Promise<SuccessInterface> {
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
    learnersCoursesListDto.sort = learnersCoursesListDto.sort ? learnersCoursesListDto.sort : LearnerCourseListSortBy.Relevance;
    learnersCoursesListDto.credits = learnersCoursesListDto.credits ? learnersCoursesListDto.credits : false;
    learnersCoursesListDto.continuingCredits = learnersCoursesListDto.continuingCredits ? learnersCoursesListDto.continuingCredits : false;

    const learner = req.user ? await this.learnersService.getLearnerById(req.user._id) : null;
    const queryParams = req.url.split('?')[1] ? req.url.split('?')[1] : 'page=1&perPage=6';

    return await this.coursesService.getCoursesforLearners(learnersCoursesListDto, learner, queryParams);
  }

  @ApiOperation({ summary: 'Get highest course price and enrollment size.' })
  @Get('filter/values')
  async GetHighestPriceAndEnrollment() {
    return await this.coursesService.getHighestPriceAndEnrollmentSize();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add courses to learners cart.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('addToCart')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  async AddCoursesToCart(@Body() addToCartDto: AddToCartDto, @GetUser() user) {
    return await this.coursesService.addToCart(addToCartDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add courses to learners wishlist(bookmark).' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('addToWishList')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  async AddCoursesToWishList(@Body() courseIdsDto: CourseIdsDto, @GetUser() user) {
    return await this.coursesService.addToWishList(courseIdsDto.courses, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add courses to learners checkoutList.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('addToCheckout')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  async AddCoursesToCheckoutList(@Body() courseIdsDto: CourseIdsDto, @GetUser() user) {
    const courses = [];
    courseIdsDto.courses.forEach(courseId => {
      courses.push({ course: courseId });
    });
    return await this.coursesService.addToCheckoutList(courses, courseIdsDto.courses, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Give course a review.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('addReview')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  async AddCourseReview(@Body() postReviewDto: PostReviewDto, @GetUser() learner) {
    const course = await this.coursesService.getCourseById(postReviewDto.courseId);
    const instructorRatingId = await this.coursesService.getRatingCategoryIdbyIdentifier(ratingCategories.teachingMethodology);

    if (!course) {
      ResponseHandler.fail(responseMessages.common.invalidCourseId);
    }
    if (!moment(course.date.end).isBefore(moment())) {
      return ResponseHandler.fail(responseMessages.postReview.courseNotFinished);
    }

    const enrollment = await this.enrollmentsService.getLearnersCourseEnrollment(learner._id, course._id);

    if (
      !enrollment ||
      (enrollment.status !== EnrollmentStatus.APPROVED &&
        enrollment.status !== EnrollmentStatus.PROCESSED &&
        enrollment.status !== EnrollmentStatus.TRANSFERRED)
    ) {
      return ResponseHandler.fail(responseMessages.postReview.courseNotEnrolled);
    }

    if (course.reviews && course.reviews.length > 0) {
      if (course.reviews.find(elem => elem.learner.toString() === learner._id.toString())) {
        return ResponseHandler.fail(responseMessages.postReview.alreadyReviewed);
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
    } else {
      course.reviews = [review];
      rating = avgRating;
      instructorRating = currentInstructorRating;
    }

    course.rating = rating;
    course.instructorRating = instructorRating;
    const updatedCourse = await course.save();
    return ResponseHandler.success({ updatedCourse });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated list of courses.' })
  @UseGuards(AuthGuard('jwt'))
  @Get('reviews/:reviewId')
  async GetReviewById(@Query() reviewIdDto: ReviewIdDto) {
    return await this.coursesService.getReviewById(reviewIdDto.reviewId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tax to be paid by a learner for a course.' })
  @UseGuards(AuthGuard('jwt'))
  @Get('tax')
  async getCourseTax(@Query() getCourseTaxLearnerDto: GetCourseTaxLearnerDto, @GetUser() learner) {
    const course = await this.coursesService.getCourseById(getCourseTaxLearnerDto.courseId);
    const learnerObj = await this.learnersService.getLearnerById(learner._id);

    return await this.coursesService.getTaxForLearner(course, learnerObj);
  }
  // .data
  @ApiOperation({ summary: 'Get course details.' })
  @Get('/:courseId')
  async GetCourseDetails(@Param() courseIdDto: CourseNumIdDto, @Req() req) {
    const [course, enrollmentsCount, ratings] = await Promise.all([
      this.coursesService.getCourseDetails(courseIdDto.courseId),
      this.enrollmentsService.getCourseEnrollmentsCount(courseIdDto.courseId),
      this.coursesService.getRatingsById(courseIdDto.courseId, true),
    ]);

    !course ? ResponseHandler.fail(responseMessages.common.invalidCourseId, null, 404) : null;

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
    // console.log(req);
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
    // console.log(prevRatings);
    course.enrollmentStatus = enrollmentStatus;
    course.enrollmentId = enrollmentId;
    course.ratingDetails = prevRatings ? prevRatings : ratings;
    course.college = course.collegeId;
    delete course.collegeId;

    // updating course and college timezones if they don't exist or don't have shortForm
    if (!course.timeZone && !course.college.timeZone) {
      course.timeZone = defaultCollegeTimeZone;
      this.coursesService.updateCourseTimeZone(course._id, defaultCollegeTimeZone);
      this.collegesService.updateCollegeTimeZone(course.college._id, defaultCollegeTimeZone);
    } else if (!course.timeZone) {
      defaultCollegeTimeZones.forEach(timeZone => {
        if (timeZone.label === course.college.timeZone.label) {
          course.timeZone = timeZone;
          this.coursesService.updateCourseTimeZone(course._id, timeZone);
        }
      });
    } else if (!course.college.timeZone) {
      this.collegesService.updateCollegeTimeZone(course.college._id, defaultCollegeTimeZone);
    } else {
      if (!course.college.timeZone.shortForm) {
        defaultCollegeTimeZones.forEach(timeZone => {
          if (timeZone.label === course.college.timeZone.label) {
            this.collegesService.updateCollegeTimeZone(course.college._id, timeZone);
          }
        });
      }
      if (!course.timeZone.shortForm) {
        defaultCollegeTimeZones.forEach(timeZone => {
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
      } catch (e) {
        course.salesTax = 0;
        course.totalPriceWithTax = course.coursePrice;

        return ResponseHandler.success(
          {
            course,
          },
          e.response.message,
        );
      }
    }

    return course
      ? ResponseHandler.success({
          course,
        })
      : ResponseHandler.fail(responseMessages.common.invalidCourseId, null, 404);
  }
}
