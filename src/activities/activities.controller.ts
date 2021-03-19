import {Body, Controller, Get, Param, Post, Query, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags} from '@nestjs/swagger';
import {AuthGuard} from '@nestjs/passport';
import {SuccessInterface} from '../common/ResponseHandler';
import {ActivitiesService} from './activities.service';
import { ActivityListDto } from './dto/activityList.dto';

@ApiTags('Activities')
@Controller('activities')
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of promos.' })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getActivities(@Query() activityListDto): Promise<SuccessInterface> {
    activityListDto.page = Number(activityListDto.page) ? Number(activityListDto.page) : 1;
    activityListDto.perPage = Number(activityListDto.perPage) ? Number(activityListDto.perPage) : 10;
    // activityListDto.duration = Number(activityListDto.duration) ? Number(activityListDto.duration) : null;
    activityListDto.userId = activityListDto.userId ? activityListDto.userId : null;
    activityListDto.learnerId = activityListDto.learnerId ? activityListDto.learnerId : null;
    activityListDto.courseId = activityListDto.courseId ? activityListDto.courseId : null;

    return await this.activitiesService.getActivities(activityListDto);
  }
}
