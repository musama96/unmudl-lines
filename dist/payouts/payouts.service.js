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
const ResponseHandler_1 = require("../common/ResponseHandler");
const mongoose_1 = require("@nestjs/mongoose");
let PayoutsService = class PayoutsService {
    constructor(PayoutModel) {
        this.PayoutModel = PayoutModel;
    }
    async getLastTransactionDate(collegeId) {
        const data = await this.PayoutModel.find({
            collegeId,
        })
            .sort({ createdAt: -1 })
            .exec();
        return ResponseHandler_1.default.success(data && data.length > 0 ? data[0].createdAt : null);
    }
    async addPayout(details) {
        let newPayout = new this.PayoutModel({
            status: 'approved',
            amount: details.amount,
            collegeId: details.collegeId,
            collegeUserId: details.userId,
        });
        newPayout = await newPayout.save();
        return ResponseHandler_1.default.success(newPayout);
    }
};
PayoutsService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('payouts')),
    __metadata("design:paramtypes", [Object])
], PayoutsService);
exports.PayoutsService = PayoutsService;
//# sourceMappingURL=payouts.service.js.map