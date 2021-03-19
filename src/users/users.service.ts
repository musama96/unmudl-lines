import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserRoles } from './user.model';
import { UserTokensService } from './userTokens.service';
import { CreateUserDto } from './dto/createUser.dto';
import { SignUpAdminDto } from './dto/signUpAdmin.dto';
import { InstructorCoursesListDto } from './dto/instructorCoursesList.dto';
import { UserIdDto } from '../common/dto/userId.dto';
import { AuthCredentialsDto } from '../auth/dto/authCredentialsDto';
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import { MailerService } from '@nest-modules/mailer';
import { ADMIN_FORGOT_PASSWORD_URL, COLLEGE_FORGOT_PASSWORD_URL } from '../config/config';
import * as mongoose from 'mongoose';
import responseMessages from '../config/responseMessages';
import { InviteUserDto } from '../invitations/dto/inviteUser.dto';
import * as json2csv from 'json2csv';
import { InstructorCoursesColumns } from '../common/enums/sort.enum';
import { EnrollmentStatus } from '../common/enums/enrollmentStatus.enum';
import bcrypt = require('bcryptjs');
import { ListDto } from '../common/dto/list.dto';
import { NotificationsService } from '../notifications/notifications.service';
import emailHtml from '../common/emailHtml';
import { UpdateUserRoleDto } from '../common/dto/updateUserRole.dto';
import moment = require('moment');
import { Portal } from '../email-logs/email-logs.model';
import { EmailLogsService } from '../email-logs/email-logs.service';
import { removeFilesFromS3 } from '../s3upload/s3';

@Injectable()
export class UsersService {
  private saltRounds = 10;

  constructor(
    @InjectModel('users') private readonly userModel,
    @InjectModel('trashedUsers') private readonly trashedUserModel,
    @InjectModel('courses') private readonly courseModel,
    @InjectModel('invitations') private readonly invitationModel,
    @InjectModel('id-counters') private readonly counterModel,
    @InjectModel('user-notifications') private readonly notificationsModel,
    @InjectModel('activities') private readonly activitiesModel,
    private readonly mailerService: MailerService,
    private readonly notificationsService: NotificationsService,
    private readonly emailLogsService: EmailLogsService,
    @Inject(forwardRef(() => UserTokensService)) private readonly userTokensService: UserTokensService,
  ) {}

  async insertInvitedUser(user: InviteUserDto) {
    const newUser = new this.userModel(user);
    newUser.invitation = 'pending';
    // console.log('before User save');
    const counter = await this.counterModel.findOneAndUpdate({}, { $inc: { user: 1 } }, { new: true, upsert: true }).lean();
    newUser.numId = counter.user;
    const result = await newUser.save();
    // console.log('after user save')
    return ResponseHandler.success(result, 'User created successfully.');
  }

  async insertUser(user: CreateUserDto) {
    const newUser = new this.userModel(user);
    newUser.password = await this.getHash(user.password);
    const counter = await this.counterModel.findOneAndUpdate({}, { $inc: { user: 1 } }, { new: true, upsert: true }).lean();
    newUser.numId = counter.user;
    const result = await newUser.save();
    result.password = '';
    return ResponseHandler.success(result, 'User created successfully.');
  }

  async insertAdmin(user: SignUpAdminDto) {
    user = this.pick(user, 'fullname', 'emailAddress', 'password', 'role', 'collegeId', 'designation') as SignUpAdminDto;
    const newUser = new this.userModel(user);
    newUser.password = await this.getHash(user.password);
    const counter = await this.counterModel.findOneAndUpdate({}, { $inc: { user: 1 } }, { new: true, upsert: true }).lean();
    newUser.numId = counter.user;
    const result = await newUser.save();
    result.password = '';
    return ResponseHandler.success(result, 'User created successfully.');
  }

  async updateCollegeAdmin(user) {
    user.password = await this.getHash(user.password);
    const updatedUser = await this.userModel.findOneAndUpdate({ emailAddress: user.emailAddress }, user, { new: true }).lean();
    return updatedUser;
  }

  async updateInvitedUser(user) {
    const { password, profilePhoto, profilePhotoThumbnail, designation, emailAddress } = user;

    const passwordHash = await this.getHash(password);

    const updatedUser = await this.userModel.findOneAndUpdate(
      {
        emailAddress,
      },
      {
        $set: {
          password: passwordHash,
          profilePhoto,
          profilePhotoThumbnail,
          designation,
          invitation: 'accepted',
        },
      },
      { new: true },
    );

    return ResponseHandler.success(updatedUser);
  }

  async updateUserRole(role, userId) {
    const newUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: { role },
        },
        {
          new: true,
        },
      )
      .lean();

    return ResponseHandler.success(newUser, 'User data updated successfully.');
  }

  async updateBasicDetails(details, userId) {
    let existingUser;
    if (details.profilePhoto) {
      existingUser = await this.userModel
        .findById(userId, 'profilePhoto profilePhotoThumbnail')
        .lean()
        .exec();
      const files = [];
      existingUser.profilePhoto !== details.profilePhoto ? files.push(existingUser.profilePhoto) : null;
      existingUser.profilePhotoThumbnail !== details.profilePhotoThumbnail ? files.push(existingUser.profilePhotoThumbnail) : null;
      files.length > 0 ? await removeFilesFromS3(files) : null;
    }

    const response = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: details,
      },
      { new: true },
    );

    return ResponseHandler.success(response, responseMessages.success.updateUser);
  }

  async updatePreferences(details, userId) {
    const notifications = {
      email: details.email,
      enrollment: details.enrollment,
      refund: details.refund,
      newNotification: details.newNotification,
      buyCourse: details.buyCourse,
    };

    const response = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          notifications,
        },
      },
      { new: true },
    );

    return ResponseHandler.success(response, responseMessages.success.updatePreferences);
  }

  async updateDetails(details, userId) {
    let existingUser;
    if (details.profilePhoto) {
      existingUser = await this.userModel
        .findById(userId, 'profilePhoto profilePhotoThumbnail')
        .lean()
        .exec();
      const files = [];
      existingUser.profilePhoto && existingUser.profilePhoto !== details.profilePhoto ? files.push(existingUser.profilePhoto) : null;
      existingUser.profilePhotoThumbnail && existingUser.profilePhotoThumbnail !== details.profilePhotoThumbnail
        ? files.push(existingUser.profilePhotoThumbnail)
        : null;
      files.length > 0 ? await removeFilesFromS3(files) : null;
    }

    const response = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: details,
      },
      { new: true },
    );

    return ResponseHandler.success(response, responseMessages.success.updateUser);
  }

  async checkExistingUser(emailAddress, userId) {
    return await this.userModel.findOne({ emailAddress, _id: { $ne: mongoose.Types.ObjectId(userId) } }).lean();
  }

  async sendResetPasswordLink(user: User): Promise<boolean> {
    try {
      const token = await this.userTokensService.createUserToken(user._id.toString());
      const url = user.collegeId ? COLLEGE_FORGOT_PASSWORD_URL : ADMIN_FORGOT_PASSWORD_URL;
      const mailData = {
        to: user.emailAddress, // sender address
        from: user.collegeId ? process.env.PARTNER_NOREPLY_FROM : process.env.ADMIN_NOREPLY_FROM, // list of receivers
        subject: 'Password reset link', // Subject line
        template: 'userPasswordReset',
        context: {
          unmudlLogo: process.env.UNMUDL_LOGO_PATH,
          siteName: process.env.SITE_NAME,
          url,
          token,
        },
      };
      const mail = await this.mailerService.sendMail(mailData);

      mail ? this.emailLogsService.createEmailLog(mailData, user.collegeId ? Portal.COLLEGE : Portal.ADMIN) : null;

      return true;
    } catch {
      return false;
    }
  }

  async getUsers(params) {
    const keyword = params.keyword;
    const page = Number(params.page);
    const collegeId = params.collegeId;
    const perPage = Number(params.perPage);
    let users = this.userModel.find({ role: { $ne: 'system' } }).byName(keyword);
    let rows = this.userModel.countDocuments({ role: { $ne: 'system' } }).byName(keyword);

    if (collegeId) {
      users = users.byCollege(collegeId);
      rows = rows.byCollege(collegeId);
    }

    users = await users.paginate(page, perPage).exec();
    rows = await rows.exec();

    return ResponseHandler.success({
      users,
      rows,
    });
  }

  async getInstructors(params: ListDto) {
    const { keyword, collegeId, page, perPage, sortOrder, sortBy } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const pipeline = [];

    const match = {
      fullname: {
        $regex: keyword,
        $options: 'i',
      },
      role: 'instructor',
      // isSuspended: false,
      invitation: 'accepted',
    };

    if (collegeId) {
      // @ts-ignore
      match.collegeId = mongoose.Types.ObjectId(collegeId);
    }

    pipeline.push(
      ...[
        {
          $match: match,
        },
        {
          $lookup: {
            from: 'courses',
            let: { userId: '$_id' },
            pipeline: [
              { $unwind: '$instructorIds' },
              {
                // {instructorIds: '5e8d854abd7fdd11312335f2'},
                $match: { $expr: { $and: [{ $eq: ['$instructorIds', '$$userId'] }] } },
              },
              { $sort: { 'date.end': -1 } },
            ],
            // localField: '_id',
            // foreignField: 'instructorIds',
            as: 'course',
          },
        },
        // {
        //   $unwind: {
        //     path: '$course',
        //     preserveNullAndEmptyArrays: true,
        //   },
        // },
        {
          $project: {
            // 'course.title': 1,
            _id: 1,
            fullname: 1,
            emailAddress: 1,
            profilePhoto: 1,
            profilePhotoThumbnail: 1,
            designation: 1,
            lastLoggedIn: 1,
            lastCourseTaught: { $arrayElemAt: ['$course.title', 0] },
            topCourseCollegeRevenue: { $max: '$course.collegeRevenue' },
            topCourseTotalRevenue: { $max: '$course.totalRevenue' },
            topCourseSharedRevenue: { $max: '$course.unmudlRevenue' },
            coursesTaught: { $size: '$course' },
            averageRating: { $avg: '$course.rating' },
            isSuspended: 1,
            createdAt: 1,
          },
        },
        {
          $sort: sort,
        },
      ],
    );

    const instructors = await this.userModel
      .aggregate(pipeline)
      .collation({ locale: 'en', strength: 2 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    const rows = await this.getInstructorsCount(params);

    return ResponseHandler.success({
      instructors,
      rows: rows.data,
    });
  }

  async getInstructorNames(params) {
    const { keyword, collegeId } = params;

    const instructors = await this.userModel
      .find(
        {
          fullname: { $regex: keyword, $options: 'i' },
          role: UserRoles.INSTRUCTOR,
          collegeId: mongoose.Types.ObjectId(collegeId),
          isSuspended: false,
        },
        'fullname profilePhoto profilePhotoThumbnail invitation',
      )
      .lean();
    return ResponseHandler.success(instructors);
  }

  async getUsersNames(params) {
    const { keyword, collegeId } = params;

    const users = await this.userModel
      .find(
        {
          fullname: { $regex: keyword, $options: 'i' },
          collegeId: mongoose.Types.ObjectId(collegeId),
          isSuspended: false,
          role: { $ne: 'system' },
        },
        'fullname profilePhoto profilePhotoThumbnail type',
      )
      .lean();
    return ResponseHandler.success(users);
  }

  async getInvitedInstructors(params: ListDto) {
    const { keyword, collegeId, page, perPage, sortOrder, sortBy, status } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const match = {
      fullname: {
        $regex: keyword,
        $options: 'i',
      },
      role: 'instructor',
    };

    if (collegeId) {
      // @ts-ignore
      match.collegeId = mongoose.Types.ObjectId(collegeId);
    }

    if (status) {
      // @ts-ignore
      match.status = { $in: status };
    }

    const instructors = await this.invitationModel
      .aggregate([
        {
          $match: match,
        },
        {
          $sort: sort,
        },
      ])
      .collation({ locale: 'en', strength: 2 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    const rows = await this.getInvitedInstructorsCount(params);

    return ResponseHandler.success({
      instructors,
      rows: rows.data,
    });
  }

  async getInstructorsCount(params) {
    const { keyword, collegeId } = params;

    const pipeline = [];

    const match = {
      fullname: {
        $regex: keyword,
        $options: 'i',
      },
      role: 'instructor',
      // isSuspended: false,
      invitation: 'accepted',
    };

    if (collegeId) {
      // @ts-ignore
      match.collegeId = mongoose.Types.ObjectId(collegeId);
    }

    pipeline.push(
      ...[
        {
          $match: match,
        },
        {
          $lookup: {
            from: 'courses',
            localField: '_id',
            foreignField: 'instructorIds',
            as: 'course',
          },
        },
        {
          $unwind: {
            path: '$course',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: {
            'course.createdAt': -1,
          },
        },
        {
          $group: {
            _id: '$_id',
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ],
    );

    const count = await this.userModel.aggregate(pipeline).exec();

    return ResponseHandler.success(count.length > 0 ? count[0].count : 0);
  }

  async getInvitedInstructorsCount(params) {
    const { keyword, collegeId, status } = params;

    const pipeline = [];

    const match = {
      fullname: {
        $regex: keyword,
        $options: 'i',
      },
      role: 'instructor',
    };

    if (collegeId) {
      // @ts-ignore
      match.collegeId = mongoose.Types.ObjectId(collegeId);
    }

    if (status) {
      // @ts-ignore
      match.status = { $in: status };
    }

    pipeline.push(
      ...[
        {
          $match: match,
        },
        {
          $group: {
            _id: null,
            rows: { $sum: 1 },
          },
        },
      ],
    );

    const count = await this.invitationModel.aggregate(pipeline).exec();

    return ResponseHandler.success(count.length > 0 ? count[0].rows : 0);
  }

  async getInstructorsCsv(params: ListDto) {
    const { keyword, collegeId, sortOrder, sortBy } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const pipeline = [];

    const match = {
      fullname: {
        $regex: keyword,
        $options: 'i',
      },
      role: 'instructor',
      // isSuspended: false,
      invitation: 'accepted',
    };

    if (collegeId) {
      // @ts-ignore
      match.collegeId = mongoose.Types.ObjectId(collegeId);
    }

    pipeline.push(
      ...[
        {
          $match: match,
        },
        {
          $lookup: {
            from: 'courses',
            let: { userId: '$_id' },
            pipeline: [
              { $unwind: '$instructorIds' },
              {
                // {instructorIds: '5e8d854abd7fdd11312335f2'},
                $match: { $expr: { $and: [{ $eq: ['$instructorIds', '$$userId'] }] } },
              },
              { $sort: { 'date.end': -1 } },
            ],
            // localField: '_id',
            // foreignField: 'instructorIds',
            as: 'course',
          },
        },
        // {
        //   $unwind: {
        //     path: '$course',
        //     preserveNullAndEmptyArrays: true,
        //   },
        // },
        {
          $project: {
            Name: '$fullname',
            emailAddress: '$emailAddress',
            designation: '$designation',
            'Last Logged In': { $dateToString: { date: '$lastLoggedIn', format: '%Y-%m-%d' } },
            'Last Course Taught': { $arrayElemAt: ['$course.title', 0] },
            'Top Course Revenue': { $max: '$course.collegeRevenue' },
            'Total Courses Taught': { $size: '$course' },
            'Average Rating': { $avg: '$course.rating' },
            createdAt: 1,
          },
        },
        {
          $sort: sort,
        },
      ],
    );

    const instructors = await this.userModel.aggregate(pipeline).exec();

    const fields = ['Name', 'Last Logged In', 'Last Course Taught', 'Top Course Revenue', 'Total Courses Taught', 'Average Rating'];
    return json2csv.parse(instructors, { fields });
  }

  async getInvitedInstructorsCsv(params: ListDto) {
    const { keyword, collegeId, sortOrder, sortBy, status } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const match = {
      fullname: {
        $regex: keyword,
        $options: 'i',
      },
      role: 'instructor',
    };

    if (collegeId) {
      // @ts-ignore
      match.collegeId = mongoose.Types.ObjectId(collegeId);
    }

    if (status) {
      // @ts-ignore
      match.status = { $in: status };
    }

    const instructors = await this.invitationModel
      .aggregate([
        {
          $match: match,
        },
        {
          $sort: sort,
        },
        {
          $project: {
            'Full Name': '$fullname',
            Email: '$emailAddress',
            'Invitation Date': { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } },
            Status: '$status',
          },
        },
      ])
      .collation({ locale: 'en', strength: 2 })
      .exec();

    const fields = ['Full Name', 'Email', 'Invitation Date', 'Status'];
    return json2csv.parse(instructors, { fields });
  }

  async getAdmins(params: ListDto) {
    const { keyword, collegeId, page, perPage, sortBy, sortOrder } = params;

    const sort = [[sortBy, Number(sortOrder)]];

    const find = {
      fullname: {
        $regex: keyword,
        $options: 'i',
      },
      role: {
        $nin: ['instructor', 'system'],
      },
      // isSuspended: false,
      invitation: 'accepted',
    };

    if (collegeId) {
      // @ts-ignore
      find.collegeId = mongoose.Types.ObjectId(collegeId);
    } else {
      // @ts-ignore
      find.collegeId = null;
    }

    const admins = await this.userModel
      .find(find)
      .sort(sort)
      .collation({ locale: 'en', strength: 2 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    const rows = await this.getAdminsCount(params);

    return ResponseHandler.success({
      admins,
      rows: rows.data,
    });
  }

  async getInvitedAdmins(params: ListDto) {
    const { keyword, collegeId, page, perPage, sortBy, sortOrder, status } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const match = {
      fullname: {
        $regex: keyword,
        $options: 'i',
      },
      role: {
        $nin: ['instructor', 'system'],
      },
    };

    // @ts-ignore
    match.collegeId = collegeId ? mongoose.Types.ObjectId(collegeId) : null;

    if (status) {
      // @ts-ignore
      match.status = { $in: status };
    }

    const admins = await this.invitationModel
      .aggregate([
        {
          $match: match,
        },
        {
          $sort: sort,
        },
      ])
      .collation({ locale: 'en', strength: 2 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    const rows = await this.getInvitedAdminsCount(params);

    return ResponseHandler.success({
      admins,
      rows: rows.data,
    });
  }

  async getAdminsCount(params) {
    const { keyword, collegeId } = params;

    const find = {
      fullname: {
        $regex: keyword,
        $options: 'i',
      },
      role: {
        $nin: ['instructor', 'system'],
      },
      // isSuspended: false,
      invitation: 'accepted',
    };

    if (collegeId) {
      // @ts-ignore
      find.collegeId = mongoose.Types.ObjectId(collegeId);
    } else {
      // @ts-ignore
      find.collegeId = null;
    }

    const count = await this.userModel.countDocuments(find).exec();

    return ResponseHandler.success(count);
  }

  async getAdminsCsv(params: ListDto) {
    const { keyword, collegeId, sortBy, sortOrder } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const find = {
      fullname: {
        $regex: keyword,
        $options: 'i',
      },
      role: {
        $nin: ['instructor', 'system'],
      },
      // isSuspended: false,
      invitation: 'accepted',
    };

    if (collegeId) {
      // @ts-ignore
      find.collegeId = mongoose.Types.ObjectId(collegeId);
    } else {
      // @ts-ignore
      find.collegeId = null;
    }

    const admins = await this.userModel
      .aggregate([
        {
          $match: find,
        },
        {
          $project: {
            Name: '$fullname',
            'Email Address': '$emailAddress',
            Designation: '$designation',
            'Last Logged In': { $dateToString: { date: '$lastLoggedIn', format: '%Y-%m-%d' } },
            'Joining Date': { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } },
            'Permission Level': {
              $concat: [
                { $toUpper: { $substrCP: ['$role', 0, 1] } },
                {
                  $substrCP: ['$role', 1, { $subtract: [{ $strLenCP: '$role' }, 1] }],
                },
              ],
            },
            createdAt: 1,
          },
        },
        {
          $sort: sort,
        },
      ])
      .collation({ locale: 'en', strength: 2 })
      .exec();

    const fields = ['Name', 'Email Address', 'Designation', 'Last Logged In', 'Joining Date', 'Permission Level'];
    return json2csv.parse(admins, { fields });
  }

  async getInvitedAdminsCsv(params: ListDto) {
    const { keyword, collegeId, sortOrder, sortBy, status } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const match = {
      fullname: {
        $regex: keyword,
        $options: 'i',
      },
      role: {
        $nin: ['instructor', 'system'],
      },
    };

    if (collegeId) {
      // @ts-ignore
      match.collegeId = mongoose.Types.ObjectId(collegeId);
    } else {
      // @ts-ignore
      match.collegeId = null;
    }

    if (status) {
      // @ts-ignore
      match.status = { $in: status };
    }

    const admins = await this.invitationModel
      .aggregate([
        {
          $match: match,
        },
        {
          $sort: sort,
        },
        {
          $project: {
            'Full Name': '$fullname',
            Email: '$emailAddress',
            'Invitation Date': { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } },
            Status: '$status',
            'Permission Level': '$role',
          },
        },
      ])
      .collation({ locale: 'en', strength: 2 })
      .exec();

    const fields = ['Full Name', 'Email', 'Invitation Date', 'Status', 'Permission Level'];
    return json2csv.parse(admins, { fields });
  }

  async getInvitedAdminsCount(params) {
    const { keyword, collegeId, status } = params;

    const pipeline = [];

    const match = {
      fullname: {
        $regex: keyword,
        $options: 'i',
      },
      role: {
        $ne: 'instructor',
      },
    };

    if (collegeId) {
      // @ts-ignore
      match.collegeId = mongoose.Types.ObjectId(collegeId);
    } else {
      // @ts-ignore
      match.collegeId = null;
    }

    if (status) {
      // @ts-ignore
      match.status = { $in: status };
    }

    pipeline.push(
      ...[
        {
          $match: match,
        },
        {
          $group: {
            _id: null,
            rows: { $sum: 1 },
          },
        },
      ],
    );

    const count = await this.invitationModel.aggregate(pipeline).exec();

    return ResponseHandler.success(count.length > 0 ? count[0].rows : 0);
  }

  async updateRole(updateRole: UpdateUserRoleDto, user: User) {
    const userId = mongoose.Types.ObjectId(updateRole.userId);
    const existingUser = await this.userModel
      .findById(userId, 'role')
      .lean()
      .exec();
    // const userId = updateRole.userId;
    let filter = {};
    if (user.collegeId) {
      filter = { _id: userId, collegeId: user.collegeId };
    } else {
      filter = { _id: userId };
    }

    const update =
      existingUser && existingUser.role === UserRoles.INSTRUCTOR && updateRole.role !== UserRoles.INSTRUCTOR
        ? { role: updateRole.role, isPromoted: true }
        : { role: updateRole.role };

    const updatedUser = await this.userModel.findOneAndUpdate(filter, update, { new: true }).exec();
    if (updatedUser) {
      await this.invitationModel.findOneAndUpdate({ emailAddress: updatedUser.emailAddress }, update, { new: true }).exec();
    }
    this.notificationsService.permissionLevelUpdated(updatedUser, user);

    const mailData = {
      to: updatedUser.emailAddress,
      from: updatedUser.collegeId ? process.env.PARTNER_NOREPLY_FROM : process.env.ADMIN_NOREPLY_FROM,
      subject: 'UNMUDL Notification',
      template: 'updateRole',
      context: {
        unmudlLogo: process.env.UNMUDL_LOGO_PATH,
        date: moment(new Date()).format('LL'),
        user: updatedUser,
      },
    };
    const mail = await this.mailerService.sendMail(mailData);

    mail ? this.emailLogsService.createEmailLog(mailData, user.collegeId ? Portal.COLLEGE : Portal.ADMIN) : null;

    return ResponseHandler.success(updatedUser);
  }

  async getUserByEmail(emailAddress: string) {
    return await this.userModel.findOne({ emailAddress }).lean();
  }

  async getUserByEmailMongoObj(emailAddress: string) {
    return await this.userModel.findOne({ emailAddress }).exec();
  }

  async getUsersList(params, emailAddress: string) {
    const { keyword, collegeId } = params;
    const find = { invitation: 'accepted', emailAddress: { $ne: emailAddress }, role: { $ne: 'system' } };
    if (collegeId) {
      // @ts-ignore
      find.collegeId = { $in: [mongoose.Types.ObjectId(collegeId), null] };
    }

    const users = await this.userModel
      .find(find, 'fullname profilePhoto profilePhotoThumbnail role collegeId')
      .byName(keyword ? keyword : '')
      .limit(10)
      .lean()
      .exec();
    return ResponseHandler.success(users);
  }

  async getUserById(userId) {
    return await this.userModel
      .findById(userId)
      .lean()
      .exec();
  }

  async getUserByIdMongoObj(userId) {
    return await this.userModel.findById(userId).exec();
  }

  async getCollegeAccountCounts(params = null) {
    const find = {};
    const { start, end, collegeId } = params;

    if (start || end) {
      // @ts-ignore
      find.createdAt = {};
      if (start) {
        // @ts-ignore
        find.createdAt.$gte = new Date(start);
      }
      if (end) {
        // @ts-ignore
        find.createdAt.$lte = new Date(end);
      }
    }

    // @ts-ignore
    find.collegeId = collegeId ? collegeId : { $ne: null };

    const count = await this.userModel.countDocuments(find).exec();

    return ResponseHandler.success(count);
  }

  async checkIfEmailExists(emailAddress: string): Promise<SuccessInterface> {
    const exists = await this.userModel.findOne({ emailAddress }).exec();
    return ResponseHandler.success(exists, exists ? '' : 'User not found.');
  }

  async validateUserForLogin(authCredentialsDto: AuthCredentialsDto) {
    const { emailAddress, password } = authCredentialsDto;
    const user = await this.userModel
      .findOne({ emailAddress })
      .populate('collegeId')
      .select('+password')
      .lean()
      .exec();
    if (user && user.password && (await this.compareHash(password.toString(), user.password))) {
      return user;
    }
    if (user && (user.isSuspended || (user.invitation && user.invitation !== 'accepted'))) {
      return user;
    }
    return null;
  }

  async updatePassword(password: string, userId: string) {
    try {
      const passwordHash = await this.getHash(password);

      const updatedUser = await this.userModel.findOneAndUpdate({ _id: userId }, { password: passwordHash });
      return !!updatedUser;
    } catch {
      return false;
    }
  }

  async updateStripeCustomerId(userId: string, stripeCustomerId: string) {
    await this.userModel.findOneAndUpdate({ _id: userId }, { $set: { stripeCustomerId } });
  }

  async getUnmudlAdminsForEmail() {
    const admins = await this.userModel
      .find(
        {
          collegeId: null,
          role: { $in: ['superadmin', 'admin'] },
          'notifications.email': { $ne: false },
        },
        'fullname emailAddress',
      )
      .lean()
      .exec();

    return ResponseHandler.success(admins);
  }

  async getCollegeSuperAdmin(collegeId) {
    const admin = await this.userModel.findOne({ collegeId: collegeId ? collegeId : {$ne: null}, role: 'superadmin' }).lean();

    return ResponseHandler.success(admin);
  }

  async getCollegeSuperAdmins(collegeId) {
    const admin = await this.userModel.find({ collegeId, role: 'superadmin' }).lean();

    return ResponseHandler.success(admin);
  }

  async changePassword(params, userId) {
    let { newPassword } = params;
    const { oldPassword } = params;
    newPassword = await this.getHash(newPassword);
    const user = await this.userModel
      .findById(userId)
      .select('+password')
      .exec();
    if (user && (await this.compareHash(oldPassword, user.password))) {
      await this.userModel.findByIdAndUpdate(user, {
        $set: {
          password: newPassword,
        },
      });
      return ResponseHandler.success(null, responseMessages.success.updatePassword);
    } else {
      return ResponseHandler.fail(responseMessages.updateUser.invalidOldPassword);
    }
  }

  async updateLastLoggedIn(userId) {
    await this.userModel
      .findOneAndUpdate(
        {
          _id: userId,
        },
        {
          $set: {
            lastLoggedIn: Date.now(),
          },
        },
      )
      .exec();
  }

  async getAdminData(id: string) {
    const admin = await this.userModel
      .findById(id)
      .populate('collegeId')
      .lean()
      .exec();

    return ResponseHandler.success({
      user: {
        _id: admin._id,
        fullname: admin.fullname,
        username: admin.username,
        emailAddress: admin.emailAddress,
        profilePhoto: admin.profilePhoto,
        profilePhotoThumbnail: admin.profilePhotoThumbnail,
        employerId: admin.collegeId ? admin.collegeId._id : null,
        employer: admin.collegeId ? admin.collegeId.title : null,
        employerDomain: admin.collegeId ? admin.collegeId.domain : null,
        employerLogo: admin.collegeId ? admin.collegeId.collegeLogo : null,
        employerLogoThumbnail: admin.collegeId ? admin.collegeId.employerLogoThumbnail : null,
        role: admin.role,
      },
    });
  }

  async getInstructorDetails(instructor: UserIdDto) {
    const instructorId = mongoose.Types.ObjectId(instructor.userId);

    const [instructorDetails, latestCourse] = await Promise.all([
      this.userModel.aggregate([
        { $match: { _id: instructorId } },
        {
          $lookup: {
            from: 'courses',
            localField: '_id',
            foreignField: 'instructorIds',
            as: 'courses',
          },
        },
        {
          $addFields: {
            rating: { $avg: '$courses.instructorRating' },
            collegeRevenue: { $sum: '$courses.collegeRevenue' },
            totalRevenue: { $sum: '$courses.totalRevenue' },
            unmudlRevenue: { $sum: '$courses.unmudlRevenue' },
            totalCourses: { $size: '$courses' },
          },
        },
        {
          $project: {
            rating: 1,
            role: 1,
            totalRevenue: 1,
            unmudlRevenue: 1,
            collegeRevenue: 1,
            totalCourses: 1,
            fullname: 1,
            emailAddress: 1,
            profilePhoto: 1,
            profilePhotoThumbnail: 1,
            lastLoggedIn: 1,
            joinDate: '$createdAt',
            bio: 1,
          },
        },
      ]),
      this.courseModel
        .find({ instructorIds: instructorId, 'date.end': { $lte: new Date() } }, 'title')
        .sort({ 'date.end': -1 })
        .limit(1)
        .lean(),
    ]);

    instructorDetails[0].lastCourseTaught = latestCourse.length > 0 ? latestCourse[0].title : null;
    return ResponseHandler.success({
      instructorDetails: instructorDetails[0],
    });
  }

  async getTopInstructors(params) {
    const { page, perPage, start, end } = params;

    const pipeline = [];

    const match = {
      role: 'instructor',
    };

    if (start || end) {
      // @ts-ignore
      match.createdAt = {};
      if (start) {
        // @ts-ignore
        match.createdAt.$gte = new Date(start);
      }
      if (end) {
        // @ts-ignore
        match.createdAt.$lte = new Date(end);
      }
    }

    pipeline.push({
      $match: match,
    });

    const rowsPipeline = pipeline;

    pipeline.push(
      ...[
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
            from: 'courses',
            localField: '_id',
            foreignField: 'instructorIds',
            as: 'course',
          },
        },
        {
          $addFields: {
            coursesTaught: {
              $size: '$course',
            },
          },
        },
        {
          $unwind: {
            path: '$course',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: {
            totalRevenue: -1,
          },
        },
        {
          $group: {
            _id: '$_id',
            fullname: { $first: '$fullname' },
            profilePhoto: { $first: '$profilePhoto' },
            profilePhotoThumbnail: { $first: '$profilePhotoThumbnail' },
            title: { $first: { $arrayElemAt: ['$college.title', 0] } },
            topCourseRevenue: { $first: '$course.totalRevenue' },
            topCourseRatings: { $push: '$course.reviews.ratings.rating' },
            coursesTaught: { $first: '$coursesTaught' },
          },
        },
        {
          $unwind: {
            path: '$topCourseRatings',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$topCourseRatings',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$topCourseRatings',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: '$_id',
            fullname: { $first: '$fullname' },
            profilePhoto: { $first: '$profilePhoto' },
            profilePhotoThumbnail: { $first: '$profilePhotoThumbnail' },
            college: { $first: '$title' },
            topCourseRevenue: { $first: '$topCourseRevenue' },
            averageRatings: { $avg: '$topCourseRatings' },
            coursesTaught: { $first: '$coursesTaught' },
          },
        },
        {
          $sort: {
            topCourseRevenue: -1,
          },
        },
      ],
    );

    const instructors = await this.userModel
      .aggregate(pipeline)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    rowsPipeline.push({
      $group: {
        _id: null,
        rows: { $sum: 1 },
      },
    });

    const rows = await this.userModel.aggregate(rowsPipeline).exec();

    return ResponseHandler.success({
      instructors,
      rows: rows.length > 0 ? rows[0].rows : 0,
    });
  }

  async getTopInstructorsCsv(params) {
    const { page, perPage, start, end } = params;

    const pipeline = [];

    const match = {
      role: 'instructor',
    };

    if (start || end) {
      // @ts-ignore
      match.createdAt = {};
      if (start) {
        // @ts-ignore
        match.createdAt.$gte = new Date(start);
      }
      if (end) {
        // @ts-ignore
        match.createdAt.$lte = new Date(end);
      }
    }

    pipeline.push({
      $match: match,
    });

    const rowsPipeline = pipeline;

    pipeline.push(
      ...[
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
            from: 'courses',
            localField: '_id',
            foreignField: 'instructorIds',
            as: 'course',
          },
        },
        {
          $addFields: {
            coursesTaught: {
              $size: '$course',
            },
          },
        },
        {
          $unwind: {
            path: '$course',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: {
            totalRevenue: -1,
          },
        },
        {
          $group: {
            _id: '$_id',
            fullname: { $first: '$fullname' },
            title: { $first: { $arrayElemAt: ['$college.title', 0] } },
            topCourseRevenue: { $first: '$course.totalRevenue' },
            topCourseRatings: { $push: '$course.reviews.ratings.rating' },
            coursesTaught: { $first: '$coursesTaught' },
          },
        },
        {
          $unwind: {
            path: '$topCourseRatings',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$topCourseRatings',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$topCourseRatings',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: '$_id',
            'Instructor Name': { $first: '$fullname' },
            'College Name': { $first: '$title' },
            'Top Course Revenue': { $first: '$topCourseRevenue' },
            'Average Ratings': { $avg: '$topCourseRatings' },
            'Total Courses Taught': { $first: '$coursesTaught' },
          },
        },
        {
          $sort: {
            'Top Course Revenue': -1,
          },
        },
      ],
    );

    const instructors = await this.userModel
      .aggregate(pipeline)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    const fields = ['Instructor Name', 'College Name', 'Top Course Revenue', 'Total Courses Taught', 'Average Ratings'];
    return json2csv.parse(instructors, { fields });
  }

  async getInstructorCourses(coursesList: InstructorCoursesListDto) {
    let sortObj = {};
    switch (coursesList.column) {
      case InstructorCoursesColumns.courseName:
        sortObj = { title: Number(coursesList.order) };
        break;
      case InstructorCoursesColumns.price:
        sortObj = { price: Number(coursesList.order) };
        break;
      case InstructorCoursesColumns.totalEnrollments:
        sortObj = { totalEnrollments: Number(coursesList.order) };
        break;
      case InstructorCoursesColumns.enrollmentsAllowed:
        sortObj = { enrollmentsAllowed: Number(coursesList.order) };
        break;
      case InstructorCoursesColumns.totalEarnings:
        sortObj = { totalRevenue: Number(coursesList.order) };
        break;
      case InstructorCoursesColumns.enrollmentDeadline:
        sortObj = { enrollmentDeadline: Number(coursesList.order) };
        break;
    }
    const instructorId = mongoose.Types.ObjectId(coursesList.userId);
    // console.log(instructorId);
    const [List, count] = await Promise.all([
      this.courseModel
        .aggregate([
          {
            $match: { instructorIds: instructorId },
          },
          {
            $lookup: {
              from: 'enrollments',
              localField: '_id',
              foreignField: 'courseId',
              as: 'enrollments',
            },
          },
          {
            $project: {
              // instructorIds: 1,
              enrollments: {
                $filter: {
                  input: '$enrollments',
                  as: 'enroll',
                  cond: {
                    $and: [
                      { $ne: ['$$enroll.status', EnrollmentStatus.CANCELED] },
                      { $ne: ['$$enroll.status', EnrollmentStatus.REFUNDED] },
                      { $ne: ['$$enroll.status', EnrollmentStatus.DECLINED] },
                    ],
                  },
                },
              },
              title: '$title',
              rating: '$rating',
              totalRevenue: '$collegeRevenue',
              unmudlRevenue: '$unmudlRevenue',
              enrollmentsCanceled: '$enrollmentsCanceled',
              enrollmentDeadline: '$enrollmentDeadline',
              enrollmentsAllowed: '$enrollmentsAllowed',
              coverPhoto: '$coverPhoto',
              coverPhotoThumbnail: '$coverPhotoThumbnail',
              price: '$price',
            },
          },
          {
            $addFields: {
              enrolled: { $size: '$enrollments' },
            },
          },
          { $sort: sortObj },
          { $skip: (coursesList.page - 1) * coursesList.perPage },
          { $limit: coursesList.perPage },
          { $unset: 'enrollments' },
        ])
        .collation({ locale: 'en', strength: 2 })
        .exec(),
      this.courseModel.countDocuments({ instructorIds: instructorId }),
    ]);
    return ResponseHandler.success({
      List,
      count,
    });
  }

  async hasCourses(instructorId) {
    return await this.courseModel
      .findOne({ instructorIds: instructorId })
      .select({ title: 1 })
      .lean();
  }

  async removeUser(userIdDto: UserIdDto) {
    const user = await this.userModel.findById(userIdDto.userId).lean();

    const trashedUser = user;
    trashedUser.userId = user._id;
    delete trashedUser._id;
    await Promise.all([
      this.trashedUserModel.create(trashedUser),
      this.courseModel.updateMany({ instructorIds: userIdDto.userId }, { $pull: { instructorIds: userIdDto.userId } }, { multi: true }),
      this.invitationModel.deleteOne({ emailAddress: user.emailAddress }),
      this.activitiesModel.deleteMany({ user: user._id }),
      this.activitiesModel.deleteMany({ otherUser: user._id }),
    ]);
    return await this.userModel.deleteOne({ _id: mongoose.Types.ObjectId(userIdDto.userId) });
  }

  async removeInstructorFromCourses(instructor: UserIdDto) {
    return await this.courseModel.update(
      { instructorIds: instructor.userId },
      { $pull: { instructorIds: instructor.userId } },
      { multi: true },
    );
    // return true;
  }

  async getUserNotifications(params, user) {
    const { page, perPage } = params;
    const [notifications, unreadNotificationsCount] = await Promise.all([
      this.notificationsModel
        .find({
          $or: [{ receiver: user._id }, { channel: user.collegeId ? 'notification-cadmins' : 'notification-uadmins' }],
        })
        .sort({ updatedAt: -1 })
        .paginate(page, perPage)
        .populate('chat', 'module moduleDocumentId')
        .lean(),
      this.notificationsModel.countDocuments({
        $or: [{ receiver: user._id }, { channel: user.collegeId ? 'notification-cadmins' : 'notification-uadmins' }],
        isSeen: false,
      }),
    ]);

    const notificationIds = notifications.map(notification => mongoose.Types.ObjectId(notification._id));
    await this.notificationsModel.updateMany(
      { _id: { $in: notificationIds } },
      { $set: { isSeen: true } },
      { multi: true, upsert: false, timestamps: false },
    );

    return ResponseHandler.success({ notifications, unreadNotificationsCount });
  }

  async getHash(password: string | undefined): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compareHash(password: string | undefined, hash: string | undefined): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
    const copy = {} as Pick<T, K>;

    keys.forEach(key => (copy[key] = obj[key]));

    return copy;
  }
}
