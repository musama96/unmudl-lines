import { IsIn, IsNotEmpty, IsEmail } from 'class-validator';
import {ApiHideProperty, ApiProperty} from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';

export class AddCourseSuggestionDto {
  // firstname: string;
  // lastname: string;

  // @IsEmail({}, { message: responseMessages.authCredentials.invalidEmail })
  // emailAddress: string;

  // phoneNumber: string;
  courseName: string;
  collegeName: string;
  isCourseCurrentlyOffered: boolean;
  moreInfo?: string;
  contactInfo?: string;

  @ApiHideProperty()
  learnerId?: string;
}
