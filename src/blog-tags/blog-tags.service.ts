import {Injectable, Res} from '@nestjs/common';
import {BlogTag} from './blog-tag.model';
import ResponseHandler from '../common/ResponseHandler';
import {InjectModel} from '@nestjs/mongoose';
import * as slugify from 'slugify';
import * as mongoose from 'mongoose';

@Injectable()
export class BlogTagsService {
  constructor(
    @InjectModel('blog-tags') private readonly blogTagModel,
    @InjectModel('blogs') private readonly blogModel,
  ) {}

  async createBlogTag(tag: BlogTag) {
    const check = await this.blogTagModel.findOne({
      title: tag.title,
    }).exec();

    if (check) {
      return ResponseHandler.fail('Duplicate tags not allowed.');
    } else {
      // @ts-ignore
      tag.slug = slugify(tag.title, {lower: true});
      let newTag = new this.blogTagModel(tag);
      newTag = await newTag.save();

      return ResponseHandler.success(newTag);
    }
  }

  async getTags(params) {
    const {keyword, page, perPage} = params;

    const tags = await this.blogTagModel.find().byKeyword(keyword).paginate(page, perPage).exec();

    return ResponseHandler.success(tags);
  }

  async getTagBySlug(slug: string) {
    const tag = await this.blogTagModel.findOne({slug}, 'title').lean();
    return tag._id;
  }

  async getAllTags(keyword: string) {
    const tags = await this.blogTagModel.find().byKeyword(keyword).exec();

    return ResponseHandler.success(tags);
  }

  async getTagList() {
    const tags = await this.blogTagModel.find({}, 'title slug').lean();

    return tags;
  }

  async deleteTag(tagId: string) {
    const blog = await this.blogModel.findOne({tags: mongoose.Types.ObjectId(tagId)}, 'title')
      .lean().exec();
    if (blog) {
      return ResponseHandler.fail('Cannot delete tag added to a blog.');
    }
    await this.blogTagModel.deleteOne({_id: mongoose.Types.ObjectId(tagId)});

    return ResponseHandler.success({}, 'Successfully deleted.');
  }
}
