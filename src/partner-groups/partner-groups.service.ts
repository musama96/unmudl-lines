import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PartnerGroupInterface } from './partner-group.model';
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import { is } from '@babel/types';
import responseMessages from '../config/responseMessages';
import * as mongoose from 'mongoose';

@Injectable()
export class PartnerGroupsService {
  constructor(
    @InjectModel('partner-groups') private readonly partnerGroupModel,
    @InjectModel('employer-groups') private readonly employerGroupModel,
    @InjectModel('colleges') private readonly collegeModel,
    @InjectModel('employer-companies') private readonly employerModel,
  ) {}

  async addPartnerGroup(group: PartnerGroupInterface): Promise<SuccessInterface> {
    const [isTitlePresent, isColorPresent] = await Promise.all([
      this.getPartnerGroupByTitle(group.title),
      this.getPartnerGroupByHex(group.color),
    ]);
    if (isTitlePresent.data) {
      return ResponseHandler.fail(responseMessages.addPartnerGroup.titlePresent, { title: responseMessages.addPartnerGroup.titlePresent });
    } else if (isColorPresent.data) {
      return ResponseHandler.fail(responseMessages.addPartnerGroup.colorPresent, { color: responseMessages.addPartnerGroup.colorPresent });
    } else {
      let newGroup = new this.partnerGroupModel(group);
      newGroup = await newGroup.save();

      return ResponseHandler.success(newGroup);
    }
  }

  async addEmployerGroup(group: PartnerGroupInterface): Promise<SuccessInterface> {
    const [isTitlePresent, isColorPresent] = await Promise.all([
      this.getEmployerGroupByTitle(group.title),
      this.getEmployerGroupByHex(group.color),
    ]);
    if (isTitlePresent.data) {
      return ResponseHandler.fail(responseMessages.addPartnerGroup.titlePresent, { title: responseMessages.addPartnerGroup.titlePresent });
    } else if (isColorPresent.data) {
      return ResponseHandler.fail(responseMessages.addPartnerGroup.colorPresent, { color: responseMessages.addPartnerGroup.colorPresent });
    } else {
      let newGroup = new this.employerGroupModel(group);
      newGroup = await newGroup.save();

      return ResponseHandler.success(newGroup);
    }
  }

  async updatePartnerGroup(group: PartnerGroupInterface): Promise<SuccessInterface> {
    const [isTitlePresent, isColorPresent] = await Promise.all([
      this.partnerGroupModel.findOne({ title: group.title, _id: { $ne: mongoose.Types.ObjectId(group._id) } }),
      this.partnerGroupModel.findOne({ color: group.color, _id: { $ne: mongoose.Types.ObjectId(group._id) } }),
    ]);

    if (isTitlePresent || isColorPresent) {
      return ResponseHandler.fail(
        '',
        isTitlePresent
          ? { title: responseMessages.addPartnerGroup.titlePresent }
          : { color: responseMessages.addPartnerGroup.colorPresent },
      );
    }
    const oldGroup = await this.partnerGroupModel.findById(group._id);

    if (oldGroup) {
      const newGroup = await this.partnerGroupModel.findByIdAndUpdate(group._id, group, { new: true }).exec();
      return ResponseHandler.success(newGroup);
    } else {
      return ResponseHandler.fail(responseMessages.updatePartnerGroup.doesNotExist);
    }
  }

  async updateEmployerGroup(group: PartnerGroupInterface): Promise<SuccessInterface> {
    const [isTitlePresent, isColorPresent] = await Promise.all([
      this.employerGroupModel.findOne({ title: group.title, _id: { $ne: mongoose.Types.ObjectId(group._id) } }),
      this.employerGroupModel.findOne({ color: group.color, _id: { $ne: mongoose.Types.ObjectId(group._id) } }),
    ]);

    if (isTitlePresent || isColorPresent) {
      return ResponseHandler.fail(
        '',
        isTitlePresent
          ? { title: responseMessages.addPartnerGroup.titlePresent }
          : { color: responseMessages.addPartnerGroup.colorPresent },
      );
    }
    const oldGroup = await this.employerGroupModel.findById(group._id);

    if (oldGroup) {
      const newGroup = await this.employerGroupModel.findByIdAndUpdate(group._id, group, { new: true }).exec();
      return ResponseHandler.success(newGroup);
    } else {
      return ResponseHandler.fail(responseMessages.updatePartnerGroup.doesNotExist);
    }
  }

  async getAllPartnerGroup(): Promise<SuccessInterface> {
    const groups = await this.partnerGroupModel
      .aggregate([
        {
          $lookup: {
            from: 'colleges',
            let: { groupId: '$_id' },
            pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$partnerGroup', '$$groupId'] }] } } }, { $limit: 1 }, { $project: { _id: 1 } }],
            as: 'college',
          },
        },
        { $unwind: { path: '$college', preserveNullAndEmptyArrays: true } },
        { $sort: { title: 1 } },
      ])
      .collation({ locale: 'en', strength: 2 });

    return ResponseHandler.success(groups);
  }

  async getAllEmployerGroup(): Promise<SuccessInterface> {
    const groups = await this.employerGroupModel
      .aggregate([
        {
          $lookup: {
            from: 'employer-companies',
            let: { groupId: '$_id' },
            pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$employerGroup', '$$groupId'] }] } } }, { $limit: 1 }, { $project: { _id: 1 } }],
            as: 'employer',
          },
        },
        { $unwind: { path: '$employer', preserveNullAndEmptyArrays: true } },
        { $sort: { title: 1 } },
      ])
      .collation({ locale: 'en', strength: 2 });

    return ResponseHandler.success(groups);
  }

  async getPartnerGroupByTitle(title: string): Promise<SuccessInterface> {
    const group = await this.partnerGroupModel
      .findOne({
        title,
      })
      .exec();

    return ResponseHandler.success(group);
  }

  async getPartnerGroupByHex(color: string): Promise<SuccessInterface> {
    const group = await this.partnerGroupModel
      .findOne({
        color,
      })
      .exec();

    return ResponseHandler.success(group);
  }

  async getEmployerGroupByTitle(title: string): Promise<SuccessInterface> {
    const group = await this.employerGroupModel
      .findOne({
        title,
      })
      .exec();

    return ResponseHandler.success(group);
  }

  async getEmployerGroupByHex(color: string): Promise<SuccessInterface> {
    const group = await this.employerGroupModel
      .findOne({
        color,
      })
      .exec();

    return ResponseHandler.success(group);
  }

  async deleteGroup(groupId: string) {
    const college = await this.collegeModel
      .findOne({ partnerGroup: mongoose.Types.ObjectId(groupId) }, 'title')
      .lean()
      .exec();
    if (college) {
      return ResponseHandler.fail('Cannot delete partner-group added to a college.');
    }
    await this.partnerGroupModel.deleteOne({ _id: mongoose.Types.ObjectId(groupId) });

    return ResponseHandler.success({}, 'Successfully deleted.');
  }

  async deleteEmployerGroup(groupId: string) {
    const employer = await this.employerModel
      .findOne({ employerGroup: mongoose.Types.ObjectId(groupId) }, 'title')
      .lean()
      .exec();
    if (employer) {
      return ResponseHandler.fail('Cannot delete employer-group added to a employer.');
    }
    await this.employerGroupModel.deleteOne({ _id: mongoose.Types.ObjectId(groupId) });

    return ResponseHandler.success({}, 'Successfully deleted.');
  }
}
