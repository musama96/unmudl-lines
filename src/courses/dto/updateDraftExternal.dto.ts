import { Type } from 'class-transformer';
import { IsString, ValidateNested, IsNotEmpty, IsOptional, IsDateString, IsEnum, IsUrl, IsBoolean, ArrayMaxSize } from 'class-validator';
import { TimeRangeDto } from '../../common/dto/timeRange.dto';
import { Institution } from './institution.dto';
import { ApiProperty } from '@nestjs/swagger';
import { HoursOffered } from '../courses.model';
import { Venue } from '../courses.model';
import { Schedule } from '../courses.model';
import { CustomSchedule } from './customSchedule.dto';
import { Employer } from '../../employers/dto/employer.dto';
import { StateDto } from '../../common/dto/state.dto';
import { OccupationDto } from './occupation.dto';
import { KnowledgeOutcomeDto } from './knowledgeOutcome.dto';
import { SkillOutcomeDto } from './skillOutcome.dto';
import { ExperienceDto } from './experience.dto';
import { CipCertificatesDto } from './cip-certificates.dto';
import { DraftDurationDto } from '../../common/dto/draftDuration.dto';
import { LicenseDto } from './licenses.dto';
import { CertificationsDto } from './certifications.dto';
import { IsArray, IsMongoId } from '../../common/validators';
import responseMessages from '../../config/responseMessages';
import CoordinatesDto from '../../common/dto/coordinates.dto';

export class UpdateDraftExternalDto {
  @IsMongoId(false, { message: responseMessages.common.invalidCourseDraftId })
  _id: string;

  @IsOptional()
  // @IsString()
  externalCourseId?: string;

  @IsNotEmpty()
  orgId?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  coverPhoto?: any;

  @IsOptional()
  @IsString()
  coverPhotoPath?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  attachments?: string[];

  @IsMongoId(true, { message: responseMessages.common.invalidCollegeId })
  collegeId?: string;

  @IsOptional()
  @IsBoolean()
  autoEnroll?: boolean;

  @ApiProperty({ default: '[{"name": "institue", "website": "institute.com" }]' })
  @IsOptional()
  @IsArray(true)
  @ValidateNested({ each: true })
  @ArrayMaxSize(5)
  @Type(() => Institution)
  institutes?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  altTag?: string;

  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  url?: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isUnmudlOriginal?: boolean;

  // @IsNumber()
  // @Min(1)
  @IsOptional()
  price?: number;

  // @IsNumber()
  // @Min(1)
  @IsOptional()
  enrollmentsAllowed?: number;

  @IsDateString()
  @IsOptional()
  enrollmentDeadline?: string;

  @ApiProperty({ description: 'enter in form of array like ["5e21bd86529642445c61bc8d"]' })
  @IsArray(true)
  @IsMongoId(true, { message: responseMessages.common.invalidInstructorIds, each: true })
  instructorIds?: string;

  @ApiProperty({ type: String, description: 'enter in form of array like ["5e21bd86529642445c61bc8d"]', required: false })
  @IsArray(true)
  @IsMongoId(true, { message: responseMessages.common.invalidCourseId, each: true })
  relatedCourses?: string[];

  @ApiProperty({ description: 'enter in form of array like ["5e21bd86529642445c61bc8d"]' })
  @IsOptional()
  @IsArray(true)
  @ArrayMaxSize(15)
  @IsMongoId(true, { message: responseMessages.createCourse.invalidEmployerId, each: true })
  employers?: string;

  @ApiProperty({ default: '[{"title": "employer", "website": "employer.com" }]' })
  @IsOptional()
  @IsArray(true)
  @ValidateNested({ each: true })
  @Type(() => Employer)
  newEmployers?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  employersLogos?: any;

  @IsEnum(Venue, { message: responseMessages.createCourse.invalidVenue })
  @IsOptional()
  venue?: Venue;

  @IsEnum(Schedule, { message: 'Choose a valid schedule.' })
  @IsOptional()
  schedule?: Schedule;

  @ApiProperty({ required: false, description: 'required only if InPerson/Hybrid is selected.' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false, description: 'required only if InPerson/Hybrid is selected.' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ required: false })
  @ValidateNested()
  @Type(() => StateDto)
  @IsOptional()
  state?: StateDto;

  @ApiProperty({ required: false, description: 'required only if InPerson/Hybrid is selected.' })
  @IsString()
  @IsOptional()
  zip?: string;

  // @IsOptional()
  // @IsNotEmpty()
  // @IsMongoId({message: responseMessages.common.invalidCountryId})
  // country: string;

  @ApiProperty({ required: false, description: 'required only if InPerson/Hybrid is selected.' })
  @ValidateNested()
  @IsOptional()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;

  @ApiProperty({ required: false })
  @IsMongoId(true, { message: responseMessages.common.invalidCourseId })
  followUpCourseId?: string;

  @ValidateNested()
  @Type(() => DraftDurationDto)
  @IsOptional()
  date?: DraftDurationDto;

  @ApiProperty({ type: String, default: '[{hoursOffered:"daytime", start: "5:17 PM", end: "9:17 PM"}]' })
  @IsOptional()
  @IsArray(true)
  @ValidateNested({ each: true })
  @Type(() => TimeRangeDto)
  time?: TimeRangeDto[];

  @ApiProperty({ type: String, default: '["daytime", "evening", "weekend", "flexibleOnline"]' })
  @IsArray(true)
  @IsEnum(HoursOffered, { each: true, message: responseMessages.createCourse.invalidHoursOffered })
  @IsOptional()
  hoursOffered?: HoursOffered[];

  @IsOptional()
  // @IsNumber()
  hoursPerWeek?: number;

  @IsOptional()
  // @IsNumber()
  estimatedWeeks?: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  outline?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  eligibilityRestrictions?: string;

  // @ApiProperty({description: 'enter in form of array like ["Project Mangement", "Business Analysis"]'})
  // @IsArray()
  // @IsString({each: true})
  // skillOutcomes: string;

  @ApiProperty({ description: 'enter in form of array like ["5e21bd86529642445c61bc8d", "5e21bd86529642445c61bc8g"]' })
  @IsArray(true)
  @IsMongoId(true, { message: responseMessages.createCourse.invalidPerformanceOutcome, each: true })
  performanceOutcomes?: string;

  // @ApiProperty({ required: false })
  // @IsOptional()
  // @IsMongoId({message: responseMessages.common.invalidCourseId})
  // relatedCourse?: string;

  // @ApiProperty({description: 'enter in form of array', required: false})
  // @IsOptional()
  // @IsArray()
  // @IsString({each: true})
  // associateDegrees?: string;

  // @ApiProperty({description: 'enter in form of array', required: false})
  // @IsOptional()
  // @IsArray()
  // @IsString({each: true})
  // certificates?: string;

  // @ApiProperty({description: 'enter in form of array', required: false})
  // @IsOptional()
  // @IsArray()
  // @IsString({each: true})
  // certifications?: string;
  @ApiProperty({
    type: String,
    default:
      '[{Id:"6714-A", Name: "Academic Certification in Neurofeedback", Organization: "Biofeedback Certification International Alliance", Description: "This certification path requires an MA/MS degree from a regionally-accredited academic institution, in no specified field, and is for those who wish to use neurofeedback in an academic, research, or supervisory setting and who do not clinically treat medical/psychological disorders"}]',
  })
  @IsOptional()
  @IsArray(true)
  @ValidateNested({ each: true })
  @Type(() => CertificationsDto)
  certifications?: CertificationsDto[];

  // @ApiProperty({description: 'enter in form of array', required: false})
  // @IsOptional()
  // @IsArray()
  // @IsString({each: true})
  // licenses?: string;
  @ApiProperty({
    type: String,
    default:
      '[{ID:"10-EDUCA08310", Title: "Teacher of Trade & Industry: Medical Assisting", Description: "Teacher of Trade & Industry: Medical Assisting"}]',
  })
  @IsOptional()
  @IsArray(true)
  @ValidateNested({ each: true })
  @Type(() => LicenseDto)
  licenses?: LicenseDto[];

  @ApiProperty({ description: 'enter in form of array', required: false })
  @IsOptional()
  @IsArray(true)
  @IsString({ each: true })
  certificatesPath?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  attendanceInformation?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomSchedule)
  customSchedule?: CustomSchedule;

  @ApiProperty({ type: String, default: '[{code:"17-2071.00", title: "Electrical Engineers"}]' })
  @IsOptional()
  @IsArray(true)
  @ValidateNested({ each: true })
  @Type(() => OccupationDto)
  occupations?: OccupationDto[];

  @ApiProperty({
    type: String,
    default:
      '[{id:"2.C.3.e", name: "Mechanical", description: "Knowledge of machines and tools, including their designs, uses, repair, and maintenance.", level: 1}]',
  })
  @IsOptional()
  @IsArray(true)
  @ValidateNested({ each: true })
  @Type(() => KnowledgeOutcomeDto)
  knowledgeOutcomes?: KnowledgeOutcomeDto[];

  @ApiProperty({
    type: String,
    default:
      '[{id:"2.A.1.b", name: "Active Listening", description: "Giving full attention to what other people are saying, taking time to understand the points being made, asking questions as appropriate, and not interrupting at inappropriate times.", level: 1}]',
  })
  @IsOptional()
  @IsArray(true)
  @ValidateNested({ each: true })
  @Type(() => SkillOutcomeDto)
  skillOutcomes?: SkillOutcomeDto[];

  @ApiProperty({
    type: String,
    default: '[{id:"4.A.1.a.2.I07.D09", name: "Monitor work areas or procedures to ensure compliance with safety procedures.", hours: 0}]',
  })
  @IsOptional()
  @IsArray(true)
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experiences?: ExperienceDto[];

  @ApiProperty({
    type: String,
    default:
      '[{CIPTitle: "Natural Resources/Conservation", CIPCode: "03.0101", CIPDefinition: "A general program that focuses on the studies and activities relating to the natural environment and its conservation"}]',
  })
  @IsOptional()
  @IsArray(true)
  @ValidateNested({ each: true })
  @Type(() => CipCertificatesDto)
  associateDegrees?: CipCertificatesDto[];

  @ApiProperty({
    type: String,
    default:
      '[{CIPTitle: "Natural Resources/Conservation", CIPCode: "03.0101", CIPDefinition: "A general program that focuses on the studies and activities relating to the natural environment and its conservation"}]',
  })
  @IsOptional()
  @IsArray(true)
  @ValidateNested({ each: true })
  @Type(() => CipCertificatesDto)
  certificates?: CipCertificatesDto[];

  // @IsNumber()
  @IsOptional()
  credits?: number;

  // @IsNumber()
  @IsOptional()
  continuingCredits?: number;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  coverPhotoThumbnail?: any;

  @IsOptional()
  @IsString()
  coverPhotoThumbnailPath?: string;

  @IsOptional()
  @IsString()
  instructorDisplayName?: string;
}
