import {Body, Controller, Delete, Get, HttpCode, Param, Post, Query, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags} from '@nestjs/swagger';
import {BugReportsService} from './bug-reports.service';
import {AuthGuard} from '@nestjs/passport';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {GetUser} from '../auth/get-user.decorator';
import {BugReportsListDto} from './dto/bugReportsList.dto';
import {BugReportIdDto} from '../common/dto/bugReportId.dto';
import {ReviewBugReportDto} from './dto/reviewBugReport.dto';

@Controller('bug-reports')
@ApiTags('Bug Reports (Admin Panel)')
export class BugReportsController {
  constructor(private readonly bugReportsService: BugReportsService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get bug reports list.' })
  @Get()
  async GetBugReports(@Query() bugReportsListDto: BugReportsListDto, @GetUser() user) {
    bugReportsListDto.page = bugReportsListDto.page ? bugReportsListDto.page : 1;
    bugReportsListDto.perPage = bugReportsListDto.perPage ? bugReportsListDto.perPage : 10 ;
    bugReportsListDto.keyword = bugReportsListDto.keyword ? bugReportsListDto.keyword : '';

    return await this.bugReportsService.getBugReports(bugReportsListDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get bug report details.' })
  @Get('/details/:bugReportId')
  async GetBlogDetails(@Param() bugReportIdDto: BugReportIdDto) {
    return await this.bugReportsService.getReportDetails(bugReportIdDto.bugReportId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Set bug report status to reviewed.' })
  @Post('update')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async ReviewBugReport(@Body() reviewBugReportDto: ReviewBugReportDto, @GetUser() user) {
    reviewBugReportDto.resolvedBy = user._id;

    return await this.bugReportsService.reviewBugReport(reviewBugReportDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Set bug report status to deleted.' })
  @Delete()
  @ApiConsumes('application/x-www-form-urlencoded')
  async DeleteBugReport(@Body() bugReportIdDto: BugReportIdDto) {
    return await this.bugReportsService.deleteBugReport(bugReportIdDto.bugReportId);
  }
}
