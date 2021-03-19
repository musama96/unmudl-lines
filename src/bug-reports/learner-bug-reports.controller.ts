import {Body, Controller, Get, HttpCode, Param, Post, Query, UseGuards} from '@nestjs/common';
import {BugReportsService} from './bug-reports.service';
import {ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags} from '@nestjs/swagger';
import {AuthGuard} from '@nestjs/passport';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {GetUser} from '../auth/get-user.decorator';
import {BugReportsListDto} from './dto/bugReportsList.dto';
import {BugReportIdDto} from '../common/dto/bugReportId.dto';
import {UpdateBlogPublishedDto} from '../blogs/dto/updateBlogPublished.dto';
import {ReviewBugReportDto} from './dto/reviewBugReport.dto';
import {CreateBugReportDto} from './dto/createBugReport.dto';

@Controller('bug-reports')
@ApiTags('Bug Reports (User Portal)')
export class LearnerBugReportsController {
  constructor(private readonly bugReportsService: BugReportsService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create a bug report.' })
  @Post()
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async UpdateBlogPublishedStatus(@Body() createBugReportDto: CreateBugReportDto, @GetUser() user) {
    createBugReportDto.reportedBy = user._id;

    return await this.bugReportsService.createBugReport(createBugReportDto);
  }
}
