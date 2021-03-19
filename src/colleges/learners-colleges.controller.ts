import { Controller, Get, Body, Query, Param } from '@nestjs/common';
import { CollegesService } from './colleges.service';
import { SuccessInterface } from '../common/ResponseHandler';
import ResponseHandler from '../common/ResponseHandler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CollegeIdDto } from '../common/dto/collegeId.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserIdDto } from '../common/dto/userId.dto';
import { CoursesService } from '../courses/courses.service';
import { LearnerNumIdDto } from '../common/dto/learnerNumId.dto';
import { CollegeNumIdDto } from '../common/dto/collegeNumId.dto';
import { InstructorNumIdDto } from '../common/dto/instructorNumId.dto';

@ApiTags('College(Learners)')
@Controller('/learners/colleges')
export class LearnersCollegesController {
  constructor(private readonly collegesService: CollegesService, private readonly coursesService: CoursesService) {}

  @ApiOperation({ summary: 'Get list of colleges.' })
  @Get()
  async GetColleges(@Query() paginationDto: PaginationDto): Promise<SuccessInterface> {
    paginationDto.keyword = paginationDto.keyword ? paginationDto.keyword : '';
    paginationDto.page = Number(paginationDto.page) ? Number(paginationDto.page) : 1;
    paginationDto.perPage = Number(paginationDto.perPage) ? Number(paginationDto.perPage) : 6;

    return await this.collegesService.getCollegesList(paginationDto);
  }

  @ApiOperation({ summary: 'Get instructor details.' })
  @Get('/instructor/details/:instructorId')
  async GetInstructorDetails(@Param() learnerNumIdDto: LearnerNumIdDto): Promise<SuccessInterface> {
    const instructorDetails = await this.collegesService.getInstructorDetails(learnerNumIdDto.instructorId);

    return instructorDetails[0] ? ResponseHandler.success({ instructor: instructorDetails[0] }) : ResponseHandler.fail('Instructor not found', null, 404);
  }

  @ApiOperation({ summary: 'Get instructor reviews.' })
  @Get('/instructor/reviews/:instructorId')
  async GetInstructorReviews(@Param() learnerNumIdDto: LearnerNumIdDto, @Query() pagination: PaginationDto): Promise<SuccessInterface> {
    pagination.page = pagination.page ? Number(pagination.page) : 1;
    pagination.perPage = pagination.perPage ? Number(pagination.perPage) : 8;
    return await this.coursesService.getInstructorReviews(learnerNumIdDto.instructorId, pagination);

    // return ResponseHandler.success({instructorReviews});
  }

  @ApiOperation({ summary: 'Get instructor reviews.' })
  @Get('/instructor/courses/:instructorId')
  async GetInstructorCourses(
    @Param() instructorNumIdDto: InstructorNumIdDto,
    @Query() pagination: PaginationDto,
  ): Promise<SuccessInterface> {
    pagination.page = pagination.page ? Number(pagination.page) : 1;
    pagination.perPage = pagination.perPage ? Number(pagination.perPage) : 8;
    return await this.coursesService.getInstructorCourses(instructorNumIdDto.instructorId, pagination);

    // return ResponseHandler.success({instructorReviews});
  }

  @ApiOperation({ summary: 'Get college details by id.' })
  @Get('/details/:collegeId')
  async GetCollegeDetails(@Param() collegeNumIdDto: CollegeNumIdDto): Promise<SuccessInterface> {
    return await this.collegesService.getCollegeByNumId(collegeNumIdDto.collegeId);
  }

  @ApiOperation({ summary: 'Get college courses.' })
  @Get('/courses/:collegeId')
  async GetCollegeCourses(@Param() collegeNumIdDto: CollegeNumIdDto, @Query() paginationDto: PaginationDto): Promise<SuccessInterface> {
    // return await this.collegesService.getCollegeCourses(collegeNumIdDto.collegeId, paginationDto);
    const [college, coursesList] = await Promise.all([
      await this.collegesService.getCollegeBasicDetailsByNumId(collegeNumIdDto.collegeId),
      await this.collegesService.getCollegeCourses(collegeNumIdDto.collegeId, paginationDto),
    ]);
    return ResponseHandler.success({ college, coursesList });
  }

  @ApiOperation({ summary: 'Get college instructors.' })
  @Get('/instructors/:collegeId')
  async GetCollegeInstructors(@Param() collegeNumIdDto: CollegeNumIdDto, @Query() paginationDto: PaginationDto): Promise<SuccessInterface> {
    const [college, instructorsList] = await Promise.all([
      await this.collegesService.getCollegeBasicDetailsByNumId(collegeNumIdDto.collegeId),
      await this.collegesService.getCollegeInstructors(collegeNumIdDto.collegeId, paginationDto),
    ]);
    return college ? ResponseHandler.success({ college, instructorsList }) : ResponseHandler.fail('College not found');
  }
}
