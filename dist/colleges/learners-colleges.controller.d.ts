import { CollegesService } from './colleges.service';
import { SuccessInterface } from '../common/ResponseHandler';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CoursesService } from '../courses/courses.service';
import { LearnerNumIdDto } from '../common/dto/learnerNumId.dto';
import { CollegeNumIdDto } from '../common/dto/collegeNumId.dto';
import { InstructorNumIdDto } from '../common/dto/instructorNumId.dto';
export declare class LearnersCollegesController {
    private readonly collegesService;
    private readonly coursesService;
    constructor(collegesService: CollegesService, coursesService: CoursesService);
    GetColleges(paginationDto: PaginationDto): Promise<SuccessInterface>;
    GetInstructorDetails(learnerNumIdDto: LearnerNumIdDto): Promise<SuccessInterface>;
    GetInstructorReviews(learnerNumIdDto: LearnerNumIdDto, pagination: PaginationDto): Promise<SuccessInterface>;
    GetInstructorCourses(instructorNumIdDto: InstructorNumIdDto, pagination: PaginationDto): Promise<SuccessInterface>;
    GetCollegeDetails(collegeNumIdDto: CollegeNumIdDto): Promise<SuccessInterface>;
    GetCollegeCourses(collegeNumIdDto: CollegeNumIdDto, paginationDto: PaginationDto): Promise<SuccessInterface>;
    GetCollegeInstructors(collegeNumIdDto: CollegeNumIdDto, paginationDto: PaginationDto): Promise<SuccessInterface>;
}
