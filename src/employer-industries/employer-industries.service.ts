import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ListDto } from '../common/dto/list.dto';
import { CreateEmployerIndustryDto } from './dto/create-employer-industry.dto';
import { GetAllIndustriesDto } from './dto/get-all-industries.dto';

import ResponseHandler from '../common/ResponseHandler';

@Injectable()
export class EmployerIndustriesService {
  constructor(@InjectModel('employer-industries') private readonly employerIndustryModel) {}

  async createIndustry(industry: CreateEmployerIndustryDto) {
    let newIndustry = new this.employerIndustryModel(industry);
    newIndustry = await newIndustry.save();

    return ResponseHandler.success(newIndustry, 'New industry created successfully.');
  }

  async getAllIndustries(params: GetAllIndustriesDto) {
    const { sortBy, sortOrder, keyword } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const industries = await this.employerIndustryModel
      .find({
        title: {
          $regex: keyword,
          $options: 'i',
        },
        deletedAt: null,
      })
      .sort(sort)
      .collation({ locale: 'en', strength: 2 })
      .lean();

    return ResponseHandler.success(industries);
  }

  async getIndustries(params: ListDto) {
    const { sortBy, sortOrder, keyword, perPage, page } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const industries = await this.employerIndustryModel
      .find({
        title: {
          $regex: keyword,
          $options: 'i',
        },
        deletedAt: null,
      })
      .sort(sort)
      .collation({ locale: 'en', strength: 2 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();

    const rows = await this.employerIndustryModel
      .countDocuments({
        title: {
          $regex: keyword,
          $options: 'i',
        },
        deletedAt: null,
      })
      .exec();

    return ResponseHandler.success({ industries, rows });
  }

  async disableIndustry(id) {
    const disabledIndustry = await this.employerIndustryModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            deletedAt: new Date(),
          },
        },
        {
          new: true,
        },
      )
      .lean();

    return ResponseHandler.success(disabledIndustry, 'Industry disabled successfully.');
  }

  async enableIndustry(id) {
    const disabledIndustry = await this.employerIndustryModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            deletedAt: null,
          },
        },
        {
          new: true,
        },
      )
      .lean();

    return ResponseHandler.success(disabledIndustry, 'Industry enabled successfully.');
  }
}
