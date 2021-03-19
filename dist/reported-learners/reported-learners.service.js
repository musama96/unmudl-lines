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
const mongoose = require("mongoose");
const reported_learner_model_1 = require("./reported-learner.model");
let ReportedLearnersService = class ReportedLearnersService {
    constructor(reportedLearnerModel, learnerModel) {
        this.reportedLearnerModel = reportedLearnerModel;
        this.learnerModel = learnerModel;
    }
    async addReport(reportDetails) {
        const { learnerId, collegeId, userId, reason } = reportDetails;
        const [reportResolved, alreadyReported] = await Promise.all([
            this.reportedLearnerModel
                .findOne({
                learner: mongoose.Types.ObjectId(learnerId),
                status: { $in: [reported_learner_model_1.ReportLearnerStatus.IGNORED, reported_learner_model_1.ReportLearnerStatus.SUSPENDED] },
            }, '_id')
                .lean()
                .exec(),
            this.reportedLearnerModel
                .findOne({
                learner: mongoose.Types.ObjectId(learnerId),
                'report.user': mongoose.Types.ObjectId(userId),
            }, '_id')
                .lean()
                .exec(),
        ]);
        if (reportResolved || alreadyReported) {
            return ResponseHandler_1.default.fail(reportResolved ? 'This learners report is already resolved.' : 'You have alraedy reported this learner');
        }
        const report = await this.reportedLearnerModel
            .findOneAndUpdate({ learner: mongoose.Types.ObjectId(learnerId) }, { $addToSet: { report: { user: userId, reason }, colleges: collegeId }, status: reported_learner_model_1.ReportLearnerStatus.PENDING }, { upsert: true, new: true })
            .exec();
        return report ? ResponseHandler_1.default.success(report) : ResponseHandler_1.default.fail('Already reported.');
    }
    async updateReport(params) {
        const { reportId, status } = params;
        const report = await this.reportedLearnerModel.findByIdAndUpdate(reportId, { status }, { new: true });
        if (report.status === reported_learner_model_1.ReportLearnerStatus.SUSPENDED) {
            await this.learnerModel.findByIdAndUpdate(report.learner, { isSuspended: true }, { new: true });
        }
        return ResponseHandler_1.default.success(report, 'Report updated successfully' + report.status === reported_learner_model_1.ReportLearnerStatus.SUSPENDED ? ' and the learner is suspended.' : '.');
    }
    async getReports(params) {
        const { page, perPage } = params;
        const [reports, rows] = await Promise.all([
            this.reportedLearnerModel
                .find()
                .populate('learner', 'fullname profilePhoto profilePhotoThumbnail')
                .populate('colleges', 'title collegeLogo collegeLogoThumbnail')
                .populate('report.user', 'fullname profilePhoto profilePhotoThumbnail')
                .paginate(page, perPage)
                .lean()
                .exec(),
            this.reportedLearnerModel.countDocuments().exec(),
        ]);
        return ResponseHandler_1.default.success({ reports, rows });
    }
};
ReportedLearnersService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('reported-learners')),
    __param(1, mongoose_1.InjectModel('learners')),
    __metadata("design:paramtypes", [Object, Object])
], ReportedLearnersService);
exports.ReportedLearnersService = ReportedLearnersService;
//# sourceMappingURL=reported-learners.service.js.map