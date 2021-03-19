import { IsNumber, IsOptional, IsString, IsDateString, IsEnum, IsLatitude, IsLongitude, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { HoursOffered, RelatedCredentials } from '../courses.model';
import { Venue } from '../courses.model';
import { IsMongoId, IsArray } from '../../common/validators';

export enum CourseType {
  IN_DEMAND = 'in demand',
  HIGHLY_RATED = 'highly rated',
  ALL_COURSES = 'all courses',
}

export enum LearnerCourseListSortBy {
  Relevance = 'relevance',
  ComunityCollege = 'communityCollege',
  HighestPrice = 'highestPrice',
  LowestPrice = 'lowestPrice',
  MostRecent = 'mostRecent',
}

export enum Funding {
  WIOA = 'WIOA',
  VETERAN_BENEFITS = 'veteranBenefits',
}

export class LearnersCoursesListDto {
  @ApiProperty({ required: false, default: '' })
  @IsOptional()
  @IsString({ message: 'You must enter a string to search.' })
  keyword?: string;

  // @ApiProperty({ required: false /*, default: 'all courses'*/ })
  // @IsOptional()
  // @IsEnum(CourseType)
  // courseType?: CourseType;

  @ApiProperty({ type: String, description: 'enter in form of array like ["5ee48cf232c8833992e59cff", "5e87130e722c5a0f1c4928be"]' })
  @IsArray(true)
  // @IsMongoId(true, { message: responseMessages.common.invalidCourseId, each: true })
  @IsString({each: true})
  colleges?: string[];

  @ApiProperty({ type: String, description: 'enter in form of array like ["5ee48cf232c8833992e59cff", "5e87130e722c5a0f1c4928be"]' })
  @IsArray(true)
  // @IsMongoId(true, { message: responseMessages.common.invalidEmployerId, each: true })
  @IsString({each: true})
  employers?: string[];

  @ApiProperty({ type: String, description: 'enter in form of array' })
  collegeNames?: string[];

  @ApiProperty({ required: false, default: '0' })
  @IsOptional()
  // @IsNumber({}, { message: 'Minimum price must be a number.' })
  minPrice?: number;

  @ApiProperty({ required: false, default: '' })
  @IsOptional()
  // @IsNumber({}, { message: 'Maximum price must be a number.' })
  maxPrice?: number;

  // @ApiProperty({ required: false, default: '1' })
  // @IsOptional()
  // // @IsNumber({}, { message: 'Days left must be a number.' })
  // daysLeft?: number;

  // @ApiProperty({ required: false, default: '1' })
  // @IsOptional()
  // // @IsNumber({}, { message: 'Open can either be 0 or 1.' })
  // open?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  // @IsNumber()
  rating?: number; // [];

  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  // @IsNumber({}, { message: 'You must enter page number to fetch.' })
  page?: number;

  @ApiProperty({ required: false, default: '10' })
  @IsOptional()
  // @IsNumber({}, { message: 'You must enter a number.' })
  perPage?: number;

  // @ApiProperty({ required: false, default: '' })
  // @IsOptional()
  // @IsMongoId({message: 'You must enter a valid mongodb id.'})
  // collegeId?: string;
  @IsMongoId(true, { message: responseMessages.common.invalidCollegeId })
  collegeId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidStartDate })
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidEndDate })
  endDate?: string;

  @ApiProperty({ type: String, default: '["inperson", "online", "onlineScheduled", "blended"]', required: false })
  @IsOptional()
  @IsArray(true)
  @ArrayMinSize(1)
  @IsEnum(Venue, { each: true, message: responseMessages.createCourse.invalidVenue })
  courseType?: Venue[];

  @ApiProperty({ type: String, default: '["License", "Certificate", "Certification"]', required: false })
  @IsOptional()
  @IsArray(true)
  @ArrayMinSize(1)
  @IsEnum(RelatedCredentials, { each: true, message: responseMessages.createCourse.invalidRelatedCredentials })
  relatedCredentials?: RelatedCredentials[];

  @ApiProperty({ type: String, default: '["WIOA", "veteranBenefits"]', required: false })
  @IsOptional()
  @IsArray(true)
  @ArrayMinSize(1)
  @IsEnum(Funding, { each: true })
  funding?: Funding[];

  @ApiProperty({ type: String, default: '["daytime", "evening", "weekend", "flexibleOnline"]', required: false })
  @IsOptional()
  @IsArray(true)
  @ArrayMinSize(1)
  @IsEnum(HoursOffered, { each: true, message: responseMessages.createCourse.invalidHoursOffered })
  hoursOffered?: HoursOffered[];

  @ApiProperty({ type: String, required: false, default: '["Mechanical"]' })
  @IsOptional()
  @IsArray(true)
  @IsString({ each: true })
  knowledgeOutcomes?: string[];

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsArray(true)
  @IsString({ each: true })
  categories?: string[];

  @ApiProperty({ type: String, required: false, default: '["Educational, Guidance, School, & Vocational Counselors"]' })
  @IsOptional()
  @IsArray(true)
  @IsString({ each: true })
  occupations?: string[];

  @ApiProperty({ type: String, required: false, default: '["Repairing"]' })
  @IsOptional()
  @IsArray(true)
  @IsString({ each: true })
  skillOutcomes?: string[];

  @ApiProperty({ type: String, required: false, default: '["Mechanical"]' })
  @IsOptional()
  @IsArray(true)
  @IsString({ each: true })
  experiences?: string[];

  // @ApiProperty({ required: false, default: '["Project Mangement"]' })
  // @IsOptional()
  // performanceOutcomes?: string;

  @ApiProperty({ required: false, default: 15 })
  @IsOptional()
  minEnrollments?: number;

  @ApiProperty({ required: false, default: 15 })
  @IsOptional()
  maxEnrollments?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsLatitude({ message: responseMessages.common.invalidLat })
  lat?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsLongitude({ message: responseMessages.common.invalidLng })
  lng?: number;

  sort?: LearnerCourseListSortBy;
  credits?: boolean;
  continuingCredits?: boolean;
}
