import { Injectable } from '@nestjs/common';
import { Blog } from './blog.model';
import { InjectModel } from '@nestjs/mongoose';
import { BlogsListDto, Status } from './dto/blogsList.dto';
import ResponseHandler from '../common/ResponseHandler';
import responseMessages from '../config/responseMessages';
import * as mongoose from 'mongoose';
import { NotificationsService } from '../notifications/notifications.service';
import { BlogStatus } from '../common/enums/createBlog.enum';
import { removeFilesFromS3 } from '../s3upload/s3';
import { MailerService } from '@nest-modules/mailer';
import { BLOG_APPLICATION_MAIL } from '../config/config';
import * as moment from 'moment';

interface FindParams {
  status?: any;
  collegeId?: mongoose.Types.ObjectId;
  employerId?: mongoose.Types.ObjectId;
  featured?: any;
  title: { $regex: string; $options: string };
  tags?: string;
}

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel('blogs') private readonly blogModel,
    @InjectModel('id-counters') private readonly counterModel,
    @InjectModel('trashedBlogs') private readonly trashedBlogModel,
    @InjectModel('employer-companies') private readonly employerCompanyModel,
    private readonly notificationsService: NotificationsService,
    private readonly mailerService: MailerService,
  ) {}

  async createBlog(blog: Blog) {
    let newBlog = new this.blogModel(blog);
    const counter = await this.counterModel.findOneAndUpdate({}, { $inc: { blog: 1 } }, { new: true, upsert: true }).lean();
    newBlog.numId = counter.blog;
    newBlog = await newBlog.save();
    if (blog.collegeId) {
      await newBlog.populate('collegeId', 'title numId').execPopulate();
    } else if (blog.employerId) {
      await newBlog.populate('employerId', 'title numId').execPopulate();
    }

    if (blog.type === 'employer') {
      const employer = await this.employerCompanyModel.findById(blog.employerId).lean();

      try {
        await this.mailerService.sendMail({
          template: 'employerBlogApplication',
          to: BLOG_APPLICATION_MAIL,
          from: process.env.PARTNER_NOREPLY_FROM,
          subject: 'An employer just submitted a blog!',
          context: {
            unmudlLogo: process.env.UNMUDL_LOGO_PATH,
            date: moment(new Date()).format('LL'),
            employer: employer.title,
            blogTitle: blog.title,
          },
        });
      } catch (e) {
        return ResponseHandler.fail(e);
      }
    }

    return ResponseHandler.success(newBlog);
  }

  async getBlogById(blogId: string) {
    const pipeline = [
      {
        $match: {
          _id: mongoose.Types.ObjectId(blogId),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'contributors',
          foreignField: '_id',
          as: 'collegeContributors',
        },
      },
      {
        $lookup: {
          from: 'employer-admins',
          localField: 'employerContributors',
          foreignField: '_id',
          as: 'employerContributors',
        },
      },
      {
        $lookup: {
          from: 'blog-tags',
          localField: 'tags',
          foreignField: '_id',
          as: 'tags',
        },
      },
      {
        $lookup: {
          from: 'employer-admins',
          localField: 'employerAuthor',
          foreignField: '_id',
          as: 'employerAuthor',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'collegeAuthor',
        },
      },
      {
        $addFields: {
          tempContributors: {
            $cond: {
              if: { $gte: [{ $size: '$employerContributors' }, 1] },
              then: '$employerContributors',
              else: '$collegeContributors',
            },
          },
          tempAuthor: {
            $cond: {
              if: { $gte: [{ $size: '$employerAuthor' }, 1] },
              then: { $arrayElemAt: ['$employerAuthor', 0] },
              else: { $arrayElemAt: ['$collegeAuthor', 0] },
            },
          },
        },
      },
      { $unset: 'employerContributors' },
      { $unset: 'collegeContributors' },
      { $unset: 'employerAuthor' },
      { $unset: 'collegeAuthor' },
      { $unset: 'author' },
      { $unset: 'contributors' },
      {
        $addFields: {
          author: {
            _id: '$tempAuthor._id',
            fullname: '$tempAuthor.fullname',
            profilePhoto: '$tempAuthor.profilePhoto',
            profilePhotoThumbnail: '$tempAuthor.profilePhotoThumbnail',
            role: '$tempAuthor.role',
          },
          contributors: {
            $map: {
              input: '$tempContributors',
              as: 'contributor',
              in: {
                _id: '$$contributor._id',
                fullname: '$$contributor.fullname',
                profilePhoto: '$$contributor.profilePhoto',
                profilePhotoThumbnail: '$$contributor.profilePhotoThumbnail',
              },
            },
          },
        },
      },
      { $unset: 'tempContributors' },
      { $unset: 'tempAuthor' },
      {
        $lookup: {
          from: 'colleges',
          localField: 'collegeId',
          foreignField: '_id',
          as: 'collegeId',
        },
      },
      { $unwind: { path: '$collegeId', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'employers',
          localField: 'employerId',
          foreignField: '_id',
          as: 'employerId',
        },
      },
      { $unwind: { path: '$employerId', preserveNullAndEmptyArrays: true } },
    ];

    const blog = await this.blogModel.aggregate(pipeline).exec();

    return ResponseHandler.success(blog.length > 0 ? blog[0] : null);
  }

  async getBlogDetails(blogId: number) {
    const blog = await this.blogModel
      .findOne({ numId: Number(blogId) })
      .populate('contributors', 'fullname profilePhoto profilePhotoThumbnail')
      .populate('author', 'fullname profilePhoto profilePhotoThumbnail role')
      .populate('collegeId', 'title collegeLogo collegeLogoThumbnail')
      .populate('tags')
      .lean()
      .exec();

    if (!blog) {
      ResponseHandler.fail('Blog not found.', null, 404);
    }

    await this.blogModel.updateOne({ numId: Number(blogId) }, { $inc: { views: 1 } });
    let relatedBlogs = [];
    if (blog.tags && blog.tags.length > 0) {
      const tags = blog.tags.map(tag => tag._id);
      relatedBlogs = await this.blogModel
        .find(
          { _id: { $ne: blog._id }, tags: { $in: tags }, status: 'published' },
          'headerImage headerImageThumbnail altText title excerpt tags collegeId numId status',
        )
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('tags', 'title slug')
        .populate('author', 'fullname profilePhoto profilePhotoThumbnail role')
        .populate('collegeId', 'numId title collegeLogo collegeLogoThumbnail')
        .lean()
        .exec();
      relatedBlogs.forEach(relatedBlog => {
        relatedBlog.college = relatedBlog.collegeId;
        delete relatedBlog.collegeId;
      });
    }
    blog.college = blog.collegeId;
    delete blog.collegeId;
    return ResponseHandler.success({ blog, relatedBlogs });
  }

  async getBlogs(params: BlogsListDto) {
    const { keyword, page, perPage, status, collegeId, sortOrder, sortBy, employerId } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const pipeline = [];

    const match: FindParams = {
      title: {
        $regex: keyword,
        $options: 'i',
      },
    };

    if (status) {
      if (collegeId || employerId) {
        if (status !== 'draft') {
          match.status = {
            $ne: 'draft',
          };
        } else {
          match.status = 'draft';
        }
      } else {
        if (['published', 'pending', 'draft'].includes(status)) {
          match.status = status;
        } else if (status === 'submitted') {
          match.status = { $ne: 'draft' };
        } else if (status === 'featured') {
          match.status = 'published';
          match.featured = {
            $ne: null,
          };
        }
      }
    }

    if (collegeId) {
      match.collegeId = mongoose.Types.ObjectId(collegeId);
    } else if (employerId) {
      match.employerId = mongoose.Types.ObjectId(employerId);
    }

    pipeline.push(
      ...[
        { $match: match },
        {
          $lookup: {
            from: 'users',
            localField: 'contributors',
            foreignField: '_id',
            as: 'collegeContributors',
          },
        },
        {
          $lookup: {
            from: 'employer-admins',
            localField: 'employerContributors',
            foreignField: '_id',
            as: 'employerContributors',
          },
        },
        {
          $lookup: {
            from: 'blog-tags',
            localField: 'tags',
            foreignField: '_id',
            as: 'tags',
          },
        },
        {
          $addFields: {
            contributors: {
              $cond: {
                if: { $gte: [{ $size: '$employerContributors' }, 1] },
                then: '$employerContributors.fullname',
                else: '$collegeContributors.fullname',
              },
            },
          },
        },
        { $unset: 'employerContributors' },
        { $unset: 'collegeContributors' },
        { $sort: sort },
      ],
    );

    const blogs = await this.blogModel
      .aggregate(pipeline)
      .collation({ locale: 'en', strength: 2 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    const rows = await this.blogModel.countDocuments(match); // this.getBlogsCount(params);

    return ResponseHandler.success({
      blogs,
      rows,
    });
  }

  async getBlogsCount(params) {
    const { keyword, status, collegeId } = params;

    const find: FindParams = {
      title: {
        $regex: keyword,
        $options: 'i',
      },
    };

    if (status) {
      if (collegeId) {
        if (status !== 'draft') {
          find.status = {
            $nin: 'draft',
          };
        } else {
          find.status = 'draft';
        }
      } else {
        if (status !== 'featured') {
          find.status = status;
        } else {
          find.status = 'published';
          find.featured = {
            $ne: null,
          };
        }
      }
    }

    if (collegeId) {
      find.collegeId = collegeId;
    }

    const rows = await this.blogModel.countDocuments(find).exec();

    return ResponseHandler.success(rows);
  }

  async getPublishedBlogs(params) {
    const { keyword, page, perPage, tag } = params;

    const find: FindParams = {
      title: {
        $regex: keyword,
        $options: 'i',
      },
    };

    if (tag) {
      find.tags = tag ? tag : '';
    }

    find.status = Status.Published;

    const pipeline = [
      {
        $match: find,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'contributors',
          foreignField: '_id',
          as: 'collegeContributors',
        },
      },
      {
        $lookup: {
          from: 'employer-admins',
          localField: 'employerContributors',
          foreignField: '_id',
          as: 'employerContributors',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'collegeAuthor',
        },
      },
      {
        $lookup: {
          from: 'employer-admins',
          localField: 'employerAuthor',
          foreignField: '_id',
          as: 'employerAuthor',
        },
      },
      {
        $lookup: {
          from: 'colleges',
          localField: 'collegeId',
          foreignField: '_id',
          as: 'college',
        },
      },
      {
        $lookup: {
          from: 'employer-companies',
          localField: 'employerId',
          foreignField: '_id',
          as: 'employer',
        },
      },
      {
        $lookup: {
          from: 'blog-tags',
          localField: 'tags',
          foreignField: '_id',
          as: 'tags',
        },
      },
      {
        $addFields: {
          contributors: {
            $cond: {
              if: { $gte: [{ $size: '$employerContributors' }, 1] },
              then: '$employerContributors',
              else: '$collegeContributors',
            },
          },
          author: {
            $cond: {
              if: { $gte: [{ $size: '$employerAuthor' }, 1] },
              then: { $arrayElemAt: ['$employerAuthor', 0] },
              else: { $arrayElemAt: ['$collegeAuthor', 0] },
            },
          },
          college: { $cond: { if: { $gte: [{ $size: '$college' }, 1] }, then: { $arrayElemAt: ['$college', 0] }, else: null } },
          employer: { $cond: { if: { $gte: [{ $size: '$employer' }, 1] }, then: { $arrayElemAt: ['$employer', 0] }, else: null } },
        },
      },
      { $unset: 'employerContributors' },
      { $unset: 'collegeContributors' },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          headerImage: 1,
          headerImageThumbnail: 1,
          altText: 1,
          title: 1,
          excerpt: 1,
          numId: 1,
          'contributors._id': 1,
          'contributors.fullname': 1,
          'contributors.profilePhoto': 1,
          'contributors.profilePhotoThumbnail': 1,
          'author._id': 1,
          'author.fullname': 1,
          'author.profilePhoto': 1,
          'author.profilePhotoThumbnail': 1,
          'author.role': 1,
          'college._id': 1,
          'college.title': 1,
          'college.collegeLogo': 1,
          'college.collegeLogoThumbnail': 1,
          'college.numId': 1,
          'employer._id': 1,
          'employer.title': 1,
          'employer.employerLogo': 1,
          'employer.employerBanner': 1,
          'employer.employerLogoThumbnail': 1,
          'employer.numId': 1,
          tags: 1,
        },
      },
    ];

    const [blogsList, blogsCount] = await Promise.all([
      this.blogModel
        .aggregate(pipeline)
        .skip((page - 1) * perPage)
        .limit(perPage)
        // .find(find, 'headerImage headerImageThumbnail altText title excerpt tags collegeId numId')
        // .sort({ createdAt: -1 })
        // .paginate(page, perPage)
        // .populate('contributors', 'fullname profilePhoto profilePhotoThumbnail')
        // .populate('author', 'fullname profilePhoto profilePhotoThumbnail role')
        // .populate('collegeId', 'title collegeLogo collegeLogoThumbnail numId')
        // .populate('tags', 'title')
        // .lean()
        .exec(),
      this.blogModel.countDocuments(find),
    ]);

    // blogsList.forEach(blog => {
    //   blog.college = blog.collegeId;
    //   delete blog.collegeId;
    // });

    return { blogsList, blogsCount };
  }

  async getBlogPostsByEmployer(employerId) {
    const blogs = await this.blogModel.countDocuments({ employerId, status: 'published' }).exec();

    return ResponseHandler.success(blogs);
  }

  async getSidebarBlogs(params) {
    const { perPage, popular } = params;
    const find = { status: Status.Published };
    const sort = {};
    if (popular) {
      // @ts-ignore
      sort.views = -1;
    }
    // @ts-ignore
    sort.createdAt = -1;

    const blogs = await this.blogModel
      .find(find, 'headerImage headerImageThumbnail altText excerpt numId title createdAt tags')
      .sort(sort)
      .paginate(1, perPage)
      .populate('tags')
      .lean();
    return blogs;
  }

  async updateBlog(blog: Blog) {
    let existingBlog;
    if (blog.headerImage) {
      existingBlog = await this.blogModel
        .findById(blog._id, 'headerImage headerImageThumbnail')
        .lean()
        .exec();
      const files = [];
      existingBlog.headerImage && existingBlog.headerImage !== blog.headerImage ? files.push(existingBlog.headerImage) : null;
      existingBlog.headerImageThumbnail && existingBlog.headerImageThumbnail !== blog.headerImageThumbnail
        ? files.push(existingBlog.headerImageThumbnail)
        : null;
      files.length > 0 ? await removeFilesFromS3(files) : null;
    }

    const newBlog = await this.blogModel.findByIdAndUpdate(blog._id, blog, { new: true }).exec();
    if (blog.collegeId) {
      await newBlog.populate('collegeId', 'title numId').execPopulate();
    } else if (blog.employerId) {
      await newBlog.populate('employerId', 'title numId').execPopulate();
    }

    return ResponseHandler.success(newBlog, responseMessages.success.updateBlog);
  }

  async updateBlogPublishedStatus({ blogId, status }, userId) {
    const newBlog = await this.blogModel
      .findByIdAndUpdate(
        blogId,
        {
          $set: {
            status,
            publishDate: status === BlogStatus.PUBLISHED ? new Date() : null,
          },
        },
        { new: true },
      )
      .exec();
    if (status === BlogStatus.PUBLISHED || status === BlogStatus.UNPUBLISHED) {
      await this.notificationsService.blogStatusChanged(newBlog, userId);
    }

    return ResponseHandler.success(newBlog, responseMessages.success.updateBlogStatus);
  }

  async updateFeatured(params) {
    const { blogId, update } = params;
    await this.blogModel.updateMany({ featured: 1 }, { featured: null }, { multi: true }).exec();
    const newBlog = await this.blogModel.findByIdAndUpdate(blogId, update, { new: true }).exec();

    return ResponseHandler.success(newBlog, responseMessages.success.updateBlogStatus);
  }

  async deleteBlogById(blogId) {
    const blog = await this.blogModel.findById(blogId).exec();

    if (blog) {
      let trashedBlog = new this.trashedBlogModel({
        headerImage: blog.headerImage,
        altText: blog.altText,
        contributors: blog.contributors,
        employerContributors: blog.employerContributors,
        permalink: blog.permalink,
        tags: blog.tags,
        title: blog.title,
        excerpt: blog.excerpt,
        tagline: blog.tagline,
        status: blog.status,
        content: blog.content,
        blogId: blog._id,
      });
      trashedBlog = await trashedBlog.save();

      await this.blogModel
        .deleteOne({
          _id: blogId,
        })
        .exec();

      return ResponseHandler.success(trashedBlog, responseMessages.success.deleteBlog);
    } else {
      return ResponseHandler.fail(responseMessages.updateBlog.notFound);
    }
  }

  async getFeaturedBlog() {
    const blog = await this.blogModel
      .findOne({ featured: 1, status: 'published' }, 'headerImage headerImageThumbnail altText tags title tagline excerpt collegeId numId')
      .sort({ createdAt: -1 })
      .populate('collegeId', 'title collegeLogo collegeLogoThumbnail')
      .populate('contributors', 'fullname profilePhoto profilePhotoThumbnail')
      .populate('author', 'fullname profilePhoto profilePhotoThumbnail role')
      .populate('tags')
      .lean();

    blog.college = blog.collegeId;
    delete blog.collegeId;
    return blog;
  }

  async restoreBlogByOldId(blogId, { employerId, collegeId, userId }) {
    const blog = await this.trashedBlogModel.findOne({ blogId }).exec();

    if (blog) {
      let newBlog = new this.blogModel({
        _id: blog.blogId,
        headerImage: blog.headerImage,
        title: blog.title,
        excerpt: blog.excerpt,
        tagline: blog.tagline,
        altText: blog.altText,
        contributors: blog.contributors,
        employerContributors: blog.employerContributors,
        author: collegeId ? userId : null,
        employerAuthor: employerId ? userId : null,
        employerId,
        collegeId,
        permalink: blog.permalink,
        tags: blog.tags,
        status: blog.status,
        content: blog.content,
      });
      newBlog = await newBlog.save();

      await this.trashedBlogModel
        .deleteOne({
          _id: blog._id,
        })
        .exec();

      return ResponseHandler.success(newBlog, responseMessages.success.restoreBlog);
    } else {
      return ResponseHandler.fail(responseMessages.updateBlog.trashedNotFound);
    }
  }
}
