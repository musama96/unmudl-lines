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
const ResponseHandler_1 = require("../common/ResponseHandler");
const responseMessages_1 = require("../config/responseMessages");
let BugReportsService = class BugReportsService {
    constructor(bugReportModel) {
        this.bugReportModel = bugReportModel;
    }
    async createBugReport(report) {
        let newReport = this.bugReportModel(report);
        newReport = await newReport.save();
        return ResponseHandler_1.default.success(newReport, responseMessages_1.default.success.createBugReport);
    }
    async reviewBugReport(report) {
        const newReport = await this.bugReportModel.findByIdAndUpdate(report.bugReportId, {
            $set: {
                comment: report.comment,
                status: 'reviewed',
                resolvedBy: report.resolvedBy,
                resolvedAt: new Date(),
            },
        }, { new: true }).exec();
        return ResponseHandler_1.default.success(newReport, responseMessages_1.default.success.reviewBugReport);
    }
    async getBugReports(params) {
        const { keyword, page, perPage } = params;
        const reports = await this.bugReportModel.find({
            title: {
                $regex: keyword,
                $options: 'i',
            },
        })
            .populate('reportedBy', 'fullname , profilePhoto profilePhotoThumbnail')
            .populate('resolvedBy', 'fullname')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .lean();
        const rows = await this.bugReportModel.countDocuments({
            title: {
                $regex: keyword,
                $options: 'i',
            },
        }).exec();
        return ResponseHandler_1.default.success({
            reports, rows,
        });
    }
    async getReportDetails(reportId) {
        const report = await this.bugReportModel.findById(reportId)
            .populate('reportedBy', 'fullname , emailAddress , profilePhoto profilePhotoThumbnail')
            .populate('resolvedBy', 'fullname')
            .lean();
        return ResponseHandler_1.default.success(report);
    }
    async deleteBugReport(reportId) {
        const newReport = await this.bugReportModel.findByIdAndUpdate(reportId, {
            $set: {
                status: 'deleted',
            },
        }, { new: true }).lean();
        return ResponseHandler_1.default.success(newReport, responseMessages_1.default.success.deleteBugReport);
    }
};
BugReportsService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('bug-reports')),
    __metadata("design:paramtypes", [Object])
], BugReportsService);
exports.BugReportsService = BugReportsService;
//# sourceMappingURL=bug-reports.service.js.map