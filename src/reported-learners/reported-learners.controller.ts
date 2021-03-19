import { Body, Controller, Post, UseGuards, HttpCode, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import { ReportedLearnersService } from './reported-learners.service';
import { AddLearnerReportDto } from './dto/addLearnerReport.dto';
import { UpdateReportStatusDto } from '../posts/dto/updateReportStatus.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateLearnerReportDto } from './dto/updateReport.dto';
import { RestrictCollegeUserGuard } from '../auth/restrictCollegeUser.guard';
import { RestrictCollegeUser } from '../auth/restrictCollegeUser.decorator';

@ApiTags('Reported Learners')
@Controller('reported-learners')
export class ReportedLearnersController {
  constructor(private readonly reportedLearnersService: ReportedLearnersService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RestrictCollegeUserGuard)
  @RestrictCollegeUser()
  @ApiOperation({ summary: 'Add a reported activity (college).' })
  @Get()
  async GetLearnerReports(@Query() paginationDto: PaginationDto, @GetUser() user): Promise<SuccessInterface> {

    paginationDto.page = paginationDto.page ? Number(paginationDto.page) : 1;
    paginationDto.perPage = paginationDto.perPage ? Number(paginationDto.perPage) : 10;

    return await this.reportedLearnersService.getReports(paginationDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Add a reported activity (college).' })
  @Post()
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async AddLearnerReport(@Body() addLearnerReport: AddLearnerReportDto, @GetUser() user): Promise<SuccessInterface> {
    if (!user.collegeId) {
      return ResponseHandler.fail('Only for college users.');
    }

    addLearnerReport.userId = user._id;
    addLearnerReport.collegeId = user.collegeId;
    return await this.reportedLearnersService.addReport(addLearnerReport);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RestrictCollegeUserGuard)
  @RestrictCollegeUser()
  @ApiOperation({ summary: 'Add a reported activity (college).' })
  @Post('updateStatus')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async UpdateLearnerReportStatus(@Body() updateLearnerReport: UpdateLearnerReportDto, @GetUser() user): Promise<SuccessInterface> {

    return await this.reportedLearnersService.updateReport(updateLearnerReport);
  }
}
