import {Body, Controller, HttpCode, Post, UseGuards} from '@nestjs/common';
import {ReportedActivitiesService} from './reported-activities.service';
import {ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags} from '@nestjs/swagger';
import {AuthGuard} from '@nestjs/passport';
import {AddReportDto} from './dto/addReport.dto';
import {GetUser} from '../auth/get-user.decorator';
import ResponseHandler from '../common/ResponseHandler';
import {CoursesService} from '../courses/courses.service';

@ApiTags('Reported Activities (User Portal)')
@Controller('reported-activities')
export class LearnerReportedActivitiesController {
  constructor(
    private readonly reportedActivitiesService: ReportedActivitiesService,
    private readonly coursesService: CoursesService,
    ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({summary: 'Add a reported activity (learner).'})
  @Post('/learner')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async AddReportedActivityByLearner(@Body() addReportDto: AddReportDto, @GetUser() user) {
    if (user.collegeId) {
      return ResponseHandler.fail('You are not authorized.', null, 401);
    } else {
      const reviewResp = await this.coursesService.getReviewById(addReportDto.reviewId);

      if (reviewResp.data) {
        const review = reviewResp.data;

        addReportDto.reportedLearnerId = review.learner;
        addReportDto.reportingLearnerId = user._id;
        addReportDto.reportDate = new Date();
        addReportDto.reviewDate = review.dateAdded;
        addReportDto.status = 'pending';
        addReportDto.comment = review.review;

        return await this.reportedActivitiesService.addReport(addReportDto);
      } else {
        return ResponseHandler.fail('Review not found.');
      }
    }
  }
}
