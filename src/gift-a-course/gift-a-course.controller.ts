import { Body, Controller, Get, HttpCode, Post, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../auth/get-user.decorator';
import ResponseHandler from '../common/ResponseHandler';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { LearnersService } from '../learners/learners.service';
import { GiftCourseDto } from './dto/giftCourse.dto';
import { RedeemGiftDto } from './dto/redeemGift.dto';
import { VerifyGiftCodeDto } from './dto/verifyGiftCode.dto';
import { GiftACourseService } from './gift-a-course.service';
import { CourseIdDto } from '../common/dto/courseId.dto';
import { pusher } from '../config/config';

@ApiTags('Gift a Course (User Portal)')
@Controller('gift-course')
export class GiftACourseController {
  constructor(
    private readonly giftACourseService: GiftACourseService,
    private readonly learnersService: LearnersService,
    private enrollmentsService: EnrollmentsService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiConsumes('application/x-www-form-urlencoded')
  @HttpCode(200)
  async giftCourse(@Body() giftCourseDto: GiftCourseDto, @GetUser() user) {
    giftCourseDto.senderId = user._id;
    giftCourseDto.senderName = user.fullname;
    giftCourseDto.senderEmail = user.emailAddress;
    const learner = await this.learnersService.getLearnerByEmail(giftCourseDto.recipientEmail);

    if (learner) {
      giftCourseDto.recipientId = learner._id;
      giftCourseDto.stripeCustomerId = user.stripeCustomerId;

      return await this.giftACourseService.giftCourse(giftCourseDto, user);
    } else {
      return ResponseHandler.fail('Recipient not found.');
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('redeem')
  @ApiConsumes('application/x-www-form-urlencoded')
  @HttpCode(200)
  async redeemGift(@Body() redeemGiftDto: RedeemGiftDto, @GetUser() user) {
    const { data: gift } = await this.giftACourseService.getValidGiftByCode(redeemGiftDto.giftCode);
    if (!gift || gift.recipientId.toString() !== user._id.toString()) {
      return ResponseHandler.fail('Invalid gift code.');
    }
    const { data: enrollment, message } = await this.enrollmentsService.createEnrollmentForGift(gift, redeemGiftDto.learnerData);

    await this.giftACourseService.updateEnrollmentIdInGift(gift._id, enrollment._id);

    return ResponseHandler.success(enrollment, message);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('verify-code')
  async verifyGiftCode(@Query() verifyGiftCodeDto: VerifyGiftCodeDto, @GetUser() user) {
    const { data: gift } = await this.giftACourseService.getValidGiftByCode(verifyGiftCodeDto.giftCode);
    if (gift && gift.courseId.toString() === verifyGiftCodeDto.courseId && user._id.toString() === gift.recipientId.toString()) {
      return ResponseHandler.success(gift);
    } else {
      return ResponseHandler.fail('Invalid gift code.');
    }
  }

  @Get('mail')
  async sendMail(@Query() courseIdDto: CourseIdDto) {
    pusher.trigger('notification-5e87130f722c5a0f1c4928bf', 'source-talent-request', {});
    return true;
    // return await this.giftACourseService.sendRecepientMail(courseIdDto.courseId);
  }
}
