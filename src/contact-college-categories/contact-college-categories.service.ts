import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateContactCollegeCategoryDto } from './dto/create-contact-college-category.dto';
import { GetAllCategoriesDto } from './dto/get-all-categories.dto';
import { ListDto } from '../common/dto/list.dto';

import ResponseHandler from '../common/ResponseHandler';

@Injectable()
export class ContactCollegeCategoriesService {
  constructor(@InjectModel('contact-college-categories') private readonly contactCollegeCategoryModel) {}

  async createCategory(category: CreateContactCollegeCategoryDto) {
    let newCategory = new this.contactCollegeCategoryModel(category);
    newCategory = await newCategory.save();

    return ResponseHandler.success(newCategory, 'New category created successfully.');
  }

  async getAllCategories(params: GetAllCategoriesDto) {
    const { sortBy, sortOrder, keyword } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const categories = await this.contactCollegeCategoryModel
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

    return ResponseHandler.success(categories);
  }

  async getCategories(params: ListDto) {
    const { sortBy, sortOrder, keyword, perPage, page } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const categories = await this.contactCollegeCategoryModel
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

    const rows = await this.contactCollegeCategoryModel
      .countDocuments({
        title: {
          $regex: keyword,
          $options: 'i',
        },
        deletedAt: null,
      })
      .exec();

    return ResponseHandler.success({ categories, rows });
  }

  async disableCategory(id) {
    const disabledCategory = await this.contactCollegeCategoryModel
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

    return ResponseHandler.success(disabledCategory, 'Category disabled successfully.');
  }

  async enableCategory(id) {
    const disabledCategory = await this.contactCollegeCategoryModel
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

    return ResponseHandler.success(disabledCategory, 'Category enabled successfully.');
  }
}
