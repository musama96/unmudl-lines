import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AddCourseSuggestionDto } from './dto/addCourseSuggestion.dto';
import { MailerService } from '@nest-modules/mailer';
import moment = require('moment');
import ResponseHandler from '../common/ResponseHandler';
import { Portal } from '../email-logs/email-logs.model';
import { EmailLogsService } from '../email-logs/email-logs.service';

@Injectable()
export class CourseSuggestionsService {
  constructor(
    @InjectModel('course-suggestions') private readonly courseSuggetsionModel,
    private readonly mailerService: MailerService,
    private readonly emailLogsService: EmailLogsService,
  ) {}

  async addCourseSuggestion(courseSuggestion: AddCourseSuggestionDto) {
    const newCourseSuggestion = await this.courseSuggetsionModel.create(courseSuggestion);

    const mailData = {
      to: process.env.SUPPORT_MAIL,
      from: process.env.ADMIN_NOTIFICATION_FROM,
      subject: 'Unmudl Notification',
      template: 'courseSuggestionMail',
      context: {
        unmudlLogo: process.env.UNMUDL_LOGO_PATH,
        date: moment(new Date()).format('LL'),
        courseSuggestion,
      },
    }
    const mail = await this.mailerService.sendMail(mailData);

    mail ? this.emailLogsService.createEmailLog(mailData, Portal.LEARNER) : null;

    return ResponseHandler.success({}, 'Your request has been submitted successfully. Thank you for suggesting a new course for Unmudl.');
  }
}
