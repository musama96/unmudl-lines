"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const hbs = require('handlebars');
const fs = require('fs');
const readFile = require('util').promisify(fs.readFile);
let EmailLogsService = class EmailLogsService {
    constructor(emailLogModel) {
        this.emailLogModel = emailLogModel;
    }
    async createEmailLog(emailLog, portal) {
        try {
            const templatePath = 'src/common/templates/emails/';
            hbs.registerPartial('header', 'src/common/templates/partials');
            hbs.registerPartial('footer', 'src/common/templates/partials');
            const content = await readFile(templatePath + emailLog.template + '.hbs', 'utf8');
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
            return true;
        }
        catch (err) {
            console.log(err);
            return true;
        }
    }
};
EmailLogsService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('email-logs')),
    __metadata("design:paramtypes", [Object])
], EmailLogsService);
exports.EmailLogsService = EmailLogsService;
//# sourceMappingURL=email-logs.service.js.map