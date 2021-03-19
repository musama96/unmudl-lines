"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const partner_groups_controller_1 = require("./partner-groups.controller");
const partner_groups_service_1 = require("./partner-groups.service");
const mongoose_1 = require("@nestjs/mongoose");
const partner_group_model_1 = require("./partner-group.model");
const college_model_1 = require("../colleges/college.model");
const employer_group_model_1 = require("./employer-group.model");
const employer_groups_controller_1 = require("./employer-groups.controller");
const employer_company_model_1 = require("../employer-companies/employer-company.model");
let PartnerGroupsModule = class PartnerGroupsModule {
};
PartnerGroupsModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'partner-groups', schema: partner_group_model_1.PartnerGroupSchema },
                { name: 'employer-groups', schema: employer_group_model_1.EmployerGroupSchema },
                { name: 'colleges', schema: college_model_1.CollegeSchema },
                { name: 'employer-companies', schema: employer_company_model_1.EmployerCompanySchema },
            ]),
        ],
        controllers: [partner_groups_controller_1.PartnerGroupsController, employer_groups_controller_1.EmployerGroupsController],
        providers: [partner_groups_service_1.PartnerGroupsService],
        exports: [partner_groups_service_1.PartnerGroupsService],
    })
], PartnerGroupsModule);
exports.PartnerGroupsModule = PartnerGroupsModule;
//# sourceMappingURL=partner-groups.module.js.map