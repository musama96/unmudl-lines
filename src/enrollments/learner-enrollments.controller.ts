import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, Post, UseGuards, Get, Param } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CoursesService } from '../courses/courses.service';
import { ActivitiesService } from '../activities/activities.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateEnrollmentDto } from './dto/createEnrollment.dto';
import { GetUser } from '../auth/get-user.decorator';
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import { TransactionActivities } from '../activities/transactionActivityCategory.model';
import { ActivityTypes } from '../activities/activity.model';
import * as mongoose from 'mongoose';
import { CollegeIdDto } from '../common/dto/collegeId.dto';
import { CheckoutCartDto } from './dto/checkoutCart.dto';
import responseMessages from '../config/responseMessages';

@ApiTags('Enrollments (User Portal)')
@Controller('learner-enrollments')
export class LearnerEnrollmentsController {
  constructor(
    private readonly enrollmentsService: EnrollmentsService,
    private readonly coursesService: CoursesService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get previous enrollment data of similar college.' })
  @Get('recent-enrollment/data/:collegeId')
  async GetRecentEnrollmentData(@Param() collegeIdDto: CollegeIdDto, @GetUser() learner) {
    return await this.enrollmentsService.getRecentEnrollmentData(collegeIdDto.collegeId, learner._id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add learner enrollment data.' })
  @Post('add-enrollment')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  @UseGuards(AuthGuard('jwt'))
  async AddEnrollment(@Body() createEnrollmentDto: CreateEnrollmentDto, @GetUser() user): Promise<SuccessInterface> {
    createEnrollmentDto.learnerId = user._id;
    createEnrollmentDto.learnerName = user.fullname;
    createEnrollmentDto.stripeCustomerId = user.stripeCustomerId;
    const learner = await this.enrollmentsService.updateLearner(createEnrollmentDto.learnerData, user);
    const enrollment = await this.enrollmentsService.createEnrollment(createEnrollmentDto);

    const activityType = createEnrollmentDto.promoId ? TransactionActivities.CourseBoughtWithPromo : TransactionActivities.CourseBought;
    const activities = [
      {
        type: ActivityTypes.Transaction,
        learner: enrollment.data.learnerId,
        course: enrollment.data.courseId,
        enrollment: enrollment.data._id,
        promo: enrollment.data.promoId,
        transactionActivity: mongoose.Types.ObjectId(await this.activitiesService.getTransactionActivityId(activityType)),
      },
    ];

    await this.activitiesService.createActivities(activities);
    const courseData = await this.enrollmentsService.getCourseDetails({ courseId: enrollment.data.courseId }, user);
    enrollment.data.course = courseData.data.course;

    return ResponseHandler.success(enrollment.data, responseMessages.success.enrollmentRequestAdded);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add learner enrollment data.' })
  @Post('checkout-cart')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  @UseGuards(AuthGuard('jwt'))
  async CheckoutCart(@Body() checkoutCartDto: CheckoutCartDto, @GetUser() user) {
    // const enrollment: CreateEnrollmentDto = {courseId: null, cardId: };
    if (!user.cart || user.cart.length < 1) {
      return ResponseHandler.fail('Cart is empty');
    }
    const courses = await this.enrollmentsService.checkEnrollmentDeadline(user.cart);
    if (courses && courses.length > 0) {
      const response = 'The enrollment deadline has passed for some courses, remove them and try again.';
      return ResponseHandler.fail(response, { courses });
    }
    const promises = user.cart.map(async course => {
      const enrollment: CreateEnrollmentDto = {
        courseId: course.course,
        promoId: course.promo ? course.promo : null,
        cardId: checkoutCartDto.cardId,
        deleteCard: checkoutCartDto.deleteCard,
        learnerId: user._id,
        learnerName: user.fullname,
        stripeCustomerId: user.stripeCustomerId,
        learnerData: {
          firstname: course.firstname,
          lastname: course.lastname,
          emailAddress: course.emailAddress,
          phoneNumber: course.phoneNumber,
          address: course.address,
          dateOfBirth: course.dateOfBirth,
          hasStudentId: course.hasStudentId,
          studentId: course.studentId,
        },
      };
      return await this.enrollmentsService.createEnrollment(enrollment);
    });

    const responses = await Promise.all(promises);

    const activities = [];
    const [transactionActivity, transactionActivityWithPromo] = await Promise.all([
      this.activitiesService.getTransactionActivityId(TransactionActivities.CourseBought),
      this.activitiesService.getTransactionActivityId(TransactionActivities.CourseBoughtWithPromo),
    ]);
    // console.log(responses);
    responses.forEach(object => {
      activities.push({
        type: ActivityTypes.Transaction,
        // @ts-ignore
        learner: object.data.learnerId,
        // @ts-ignore
        course: object.data.courseId,
        // @ts-ignore
        enrollment: object.data._id,
        // @ts-ignore
        transactionActivity: object.data.promoId
          ? mongoose.Types.ObjectId(transactionActivityWithPromo)
          : mongoose.Types.ObjectId(transactionActivity),
      });
    });
    await this.activitiesService.createActivities(activities);

    return responses ? ResponseHandler.success({}, 'enrollments created successfully') : ResponseHandler.fail('Something went wrong');
  }
}
