"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const college_invitations_controller_1 = require("./college-invitations.controller");
const college_invitations_service_1 = require("./college-invitations.service");
const college_invitation_model_1 = require("./college-invitation.model");
const mongoose_1 = require("@nestjs/mongoose");
const college_model_1 = require("../colleges/college.model");
const id_counter_model_1 = require("../id-counters/id-counter.model");
const collegeToken_model_1 = require("./collegeToken.model");
const users_module_1 = require("../users/users.module");
const user_model_1 = require("../users/user.model");
const partner_requests_module_1 = require("../partner-requests/partner-requests.module");
const employer_invitations_module_1 = require("../employer-invitations/employer-invitations.module");
const employer_requests_module_1 = require("../employer-requests/employer-requests.module");
const email_logs_module_1 = require("../email-logs/email-logs.module");
let CollegeInvitationsModule = class CollegeInvitationsModule {
};
CollegeInvitationsModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'college-invitations', schema: college_invitation_model_1.CollegeInvitationSchema },
                { name: 'colleges', schema: college_model_1.CollegeSchema },
                { name: 'collegetokens', schema: collegeToken_model_1.CollegeTokenSchema },
                { name: 'id-counters', schema: id_counter_model_1.CounterSchema },
                { name: 'users', schema: user_model_1.UserSchema },
            ]),
            common_1.forwardRef(() => users_module_1.UsersModule),
            common_1.forwardRef(() => email_logs_module_1.EmailLogsModule),
            partner_requests_module_1.PartnerRequestsModule,
            employer_invitations_module_1.EmployerInvitationsModule,
            employer_requests_module_1.EmployerRequestsModule,
        ],
        controllers: [college_invitations_controller_1.CollegeInvitationsController],
        providers: [college_invitations_service_1.CollegeInvitationsService],
        exports: [college_invitations_service_1.CollegeInvitationsService],
    })
], CollegeInvitationsModule);
exports.CollegeInvitationsModule = CollegeInvitationsModule;
//# sourceMappingURL=college-invitations.module.js.map