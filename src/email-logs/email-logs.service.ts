import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EmailLog, Portal } from './email-logs.model';
const hbs = require('handlebars');
const fs = require('fs');
const readFile = require('util').promisify(fs.readFile);

@Injectable()
export class EmailLogsService {
  constructor(
    @InjectModel('email-logs') private readonly emailLogModel,
  ) {}

  async createEmailLog(emailLog: EmailLog, portal: Portal) {
    try {

      const templatePath = 'src/common/templates/emails/';
      hbs.registerPartial('header', 'src/common/templates/partials');
      hbs.registerPartial('footer', 'src/common/templates/partials');

      const content = await readFile(templatePath + emailLog.template + '.hbs', 'utf8');
      // Implement cache if you want
      const template = hbs.compile(content);

      let contentStr = template(emailLog.context);

      await this.emailLogModel.create({
        to: emailLog.to,
        from: emailLog.from,
        subject: emailLog.subject,
        template: emailLog.template,
        content: contentStr,
        portal,
      });
      // return str;
      return true;
    } catch(err) {
      console.log(err);
      return true;
    }
  }
}
