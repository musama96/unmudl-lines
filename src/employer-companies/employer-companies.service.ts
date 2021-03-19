import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateEmployerCompanyDto } from './dto/update-employer-company.dto';
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import responseMessages from '../config/responseMessages';
import { ListDto } from '../common/dto/list.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayLoad } from '../auth/jwt.payload.interface';
import { CollegesService } from '../colleges/colleges.service';
import { EmployersService } from '../employers/employers.service';
import functions from '../common/functions';
import { UnmudlAccessLogsService } from '../unmudl-access-logs/unmudl-access-logs.service';
import { removeFilesFromS3 } from '../s3upload/s3';

@Injectable()
export class EmployerCompaniesService {
  constructor(
    @InjectModel('employer-companies') private readonly employerCompanyModel,
    @InjectModel('employer-company-tokens') private readonly employerCompanyTokenModel,
    @InjectModel('employer-invitations') private readonly employerInvitationModel,
    @InjectModel('employer-admins') private readonly employerAdminModel,
    private readonly jwtService: JwtService,
    private readonly collegesService: CollegesService,
    private readonly employersService: EmployersService,
    private readonly unmudlAccessLogsService: UnmudlAccessLogsService,
  ) {}

  async getEmployerById(employerId, lean = true) {
    let employer = this.employerCompanyModel.findById(employerId).populate('industries');

    if (lean) {
      employer = await employer.lean();
    } else {
      employer = await employer.exec();
    }

    return ResponseHandler.success(employer);
  }

  async updateEmployer(employerCompany: UpdateEmployerCompanyDto) {
    let existingEmployer;
    if (employerCompany.employerLogo || employerCompany.employerBanner) {
      existingEmployer = await this.employerCompanyModel
        .findById(employerCompany._id, 'employerLogo employerLogoThumbnail employerBanner')
        .lean()
        .exec();
      const files = [];
      existingEmployer.employerLogo && existingEmployer.employerLogo !== employerCompany.employerLogo
        ? files.push(existingEmployer.employerLogo)
        : null;
      existingEmployer.employerLogoThumbnail && existingEmployer.employerLogoThumbnail !== employerCompany.employerLogoThumbnail
        ? files.push(existingEmployer.employerLogoThumbnail)
        : null;
      existingEmployer.employerBanner && existingEmployer.employerBanner !== employerCompany.employerBanner
        ? files.push(existingEmployer.employerBanner)
        : null;
      files.length > 0 ? await removeFilesFromS3(files) : null;
    }

    await this.employerCompanyModel
      .findByIdAndUpdate(employerCompany._id, {
        $set: employerCompany,
      })
      .exec();

    const newEmployerCompany = await this.employerCompanyModel
      .findById(employerCompany._id)
      .populate('industries')
      .lean();

    return ResponseHandler.success(newEmployerCompany, responseMessages.success.updateEmployerCompany);
  }

  async toggleSuspendEmployer(employerId: string) {
    const employer = await this.employerCompanyModel.findById(employerId).exec();

    employer.isSuspended = !employer.isSuspended;
    await employer.save();

    return ResponseHandler.success({}, `Employer ${employer.isSuspended ? 'suspended' : 'unsuspended'} successfully.`);
  }

  async verifyToken(token: string, remove = false) {
    const tokenData = await this.employerCompanyTokenModel.aggregate([
      { $match: { token } },
      {
        $lookup: {
          from: 'employer-companies',
          localField: 'employer',
          foreignField: '_id',
          as: 'employer',
        },
      },
      { $unwind: { path: '$employer', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'employer-invitations',
          localField: 'employer._id',
          foreignField: 'employerId',
          as: 'employerInvitation',
        },
      },
      { $match: { 'employerInvitation.isSuspended': { $ne: true } } },
      { $unset: 'employerInvitation' },
      { $unwind: { path: '$employerInvitation', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'employer-admins',
          localField: 'employer._id',
          foreignField: 'employerId',
          as: 'admin',
        },
      },
      { $unwind: { path: '$admin', preserveNullAndEmptyArrays: true } },
      { $match: { 'admin.role': 'superadmin' } },
      { $limit: 1 },
    ]);

    if (remove) {
      await this.employerCompanyTokenModel.deleteOne({ token }).exec();
    }

    return tokenData[0] ? tokenData[0] : null;
  }

  async getEmployersList(params) {
    const { keyword, page, perPage, collegeId } = params;

    const [employersList, { collegesCount, coursesCount, employersCount }] = await Promise.all([
      this.employersService.getEmployersForFilter({ keyword, collegeId }),
      // this.employerCompanyModel
      // .aggregate([
      //   {
      //     $match: { title: { $regex: keyword, $options: 'i' }, isSuspended: { $ne: true }, invitation: { $ne: 'pending' } },
      //   },
      //   { $sort: { title: 1 } },
      //   { $skip: (page - 1) * perPage },
      //   { $limit: perPage },
      //   {
      //     $lookup: {
      //       from: 'employer-industries',
      //       localField: 'industries',
      //       foreignField: '_id',
      //       as: 'industries',
      //     },
      //   },
      //   {
      //     $project: {
      //       title: 1,
      //       employerLogo: 1,
      //       employerLogoThumbnail: 1,
      //       numId: 1,
      //       description: 1,
      //       url: 1,
      //       city: 1,
      //       state: 1,
      //       country: 1,
      //       zip: 1,
      //       address: 1,
      //       streetAddress: 1,
      //       size: 1,
      //       industries: 1,
      //     },
      //   },
      //   { $sort: { title: 1 } },
      // ])
      // .collation({ locale: 'en', strength: 2 })
      // .exec(),
      this.collegesService.getCollegeStats(collegeId),
    ]);

    return ResponseHandler.success({ employersList, collegesCount, coursesCount, employersCount });
  }

  async getEmployersCount(params) {
    const { start, end } = params;

    const find = {};

    if (start || end) {
      const createdAt = {};
      if (start) {
        // @ts-ignore
        createdAt.$gte = start;
      }
      if (end) {
        // @ts-ignore
        createdAt.$lte = end;
      }

      // @ts-ignore
      find.createdAt = createdAt;
    }

    const count = await this.employerCompanyModel.countDocuments(find).exec();

    return ResponseHandler.success(count);
  }

  async getEmployerGrowth(params, csv = false) {
    const { interval, start, end } = params;

    const match = {};

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

    const pipeline = [];

    pipeline.push({
      $match: match,
    });

    switch (interval) {
      case 1:
        pipeline.push({
          $addFields: {
            day: {
              $dayOfYear: '$createdAt',
            },
            year: {
              $year: '$createdAt',
            },
          },
        });
        pipeline.push({
          $group: {
            _id: {
              day: '$day',
              year: '$year',
            },
            createdAt: { $first: '$createdAt' },
            count: { $sum: 1 },
          },
        });
        break;
      case 30:
        pipeline.push({
          $addFields: {
            month: {
              $month: '$createdAt',
            },
            year: {
              $year: '$createdAt',
            },
          },
        });
        pipeline.push({
          $group: {
            _id: {
              month: '$month',
              year: '$year',
            },
            createdAt: { $first: '$createdAt' },
            count: { $sum: 1 },
          },
        });
        break;
      case 365:
        pipeline.push({
          $addFields: {
            year: {
              $year: '$createdAt',
            },
          },
        });
        pipeline.push({
          $group: {
            _id: {
              year: '$year',
            },
            createdAt: { $first: '$createdAt' },
            count: { $sum: 1 },
          },
        });
        break;
    }

    pipeline.push({
      $unset: '_id',
    });

    if (csv) {
      pipeline.push({
        $project: {
          'Joined On': {
            $dateToString: { format: '%m-%d-%Y', date: '$createdAt' },
          },
          'New Users Registered': '$count',
          createdAt: '$createdAt',
        },
      });
    }

    const employers = await this.employerCompanyModel.aggregate(pipeline).exec();

    return ResponseHandler.success(employers);
  }

  async getEmployers(params: ListDto): Promise<SuccessInterface> {
    const { keyword, page, perPage, sortOrder, sortBy } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const pipeline = [
      {
        $match: {
          title: {
            $regex: keyword,
            $options: 'i',
          },
        },
      },
      {
        $lookup: {
          from: 'employer-groups',
          localField: 'employerGroup',
          foreignField: '_id',
          as: 'group',
        },
      },
      {
        $unwind: {
          path: '$group',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'employer-invitations',
          localField: '_id',
          foreignField: 'employerId',
          as: 'invitation',
        },
      },
      {
        $unwind: {
          path: '$invitation',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'employer-industries',
          localField: 'industries',
          foreignField: '_id',
          as: 'industries',
        },
      },
      {
        $group: {
          _id: '$_id',
          employer: { $first: '$title' },
          employerLogo: { $first: '$employerLogo' },
          employerLogoThumbnail: { $first: '$employerLogoThumbnail' },
          employerBanner: { $first: '$employerBanner' },
          contact: { $first: '$contact' },
          address: { $first: '$address' },
          city: { $first: '$city' },
          state: { $first: '$state' },
          size: { $first: '$size' },
          group: { $first: '$group' },
          date_accepted: { $first: '$invitation.date_accepted' },
          isSuspended: { $first: '$isSuspended' },
          industries: { $first: '$industries' },
        },
      },
      {
        $sort: sort,
      },
    ];

    const [employers, rows] = await Promise.all([
      this.employerCompanyModel
        .aggregate(pipeline)
        .collation({ locale: 'en', strength: 2 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec(),
      this.employerCompanyModel.countDocuments({
        title: {
          $regex: keyword,
          $options: 'i',
        },
      }),
    ]);
    return ResponseHandler.success({ employers, rows });
  }

  async getEmployersAsCsv(params: ListDto): Promise<SuccessInterface> {
    const { keyword, page, perPage, sortOrder, sortBy } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const pipeline = [
      {
        $match: {
          title: {
            $regex: keyword,
            $options: 'i',
          },
        },
      },
      {
        $lookup: {
          from: 'employer-groups',
          localField: 'employerGroup',
          foreignField: '_id',
          as: 'group',
        },
      },
      {
        $unwind: {
          path: '$group',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'employer-invitations',
          localField: '_id',
          foreignField: 'employerId',
          as: 'invitation',
        },
      },
      {
        $unwind: {
          path: '$invitation',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$_id',
          'Employer Name': { $first: '$title' },
          Location: { $first: '$address' },
          'NAICS Code': { $first: '$code' },
          // state: { $first: '$state' },
          'Employees Size': { $first: '$size' },
          // group: { $first: '$group' },
          'Date of joining': { $first: '$invitation.date_accepted' },
          // isSuspended: { $first: '$isSuspended' },
        },
      },
      {
        $sort: sort,
      },
    ];

    const employers = await this.employerCompanyModel
      .aggregate(pipeline)
      .collation({ locale: 'en', strength: 2 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();
    return ResponseHandler.success(employers);
  }

  async returnUnmudlAdminEmployerPortalAccess(employerId, user) {
    const employer = await this.employerCompanyModel.findById(employerId).lean();

    if (!employer) {
      return ResponseHandler.fail('Employer not found.');
    }

    let sysAdmin = await this.employerAdminModel.findOne({ employerId, role: 'system' }).lean();

    if (!sysAdmin) {
      const newAdmin = {
        fullname: `Unmudl Admin for ${functions.getInitialsOfWords(employer.title)}`,
        emailAddress: `${employerId}@unmudl.com`,
        password: '',
        role: 'system',
        employerId,
        lastLoggedIn: new Date(),
        designation: '',
        profilePhoto: '',
        profilePhotoThumbnail: '',
        joinDate: new Date(),
        invitation: 'accepted',
        isSuspended: false,
        notifications: {
          email: false,
          proposal: false,
          chat: false,
          newNotification: false,
        },
        archivedChats: [],
      };

      sysAdmin = await this.employerAdminModel.create(newAdmin);
    }

    this.unmudlAccessLogsService.createLog({
      type: 'employer',
      user: user._id,
      employer: employerId,
    });

    const payload: JwtPayLoad = { _id: sysAdmin._id, emailAddress: sysAdmin.emailAddress, type: 'employer' };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        _id: sysAdmin._id,
        fullname: sysAdmin.fullname,
        username: sysAdmin.username,
        emailAddress: sysAdmin.emailAddress,
        profilePhoto: '',
        profilePhotoThumbnail: '',
        employerId,
        employer: employer.title,
        employerDomain: employer.domain,
        employerLogo: employer.employerLogo,
        employerLogoThumbnail: employer.employerLogoThumbnail,
        role: sysAdmin.role,
        admin: {
          fullname: user.fullname,
          profilePhoto: user.profilePhoto,
          profilePhotoThumbnail: user.profilePhotoThumbnail,
        },
        activeSubscription: null,
      },
    };
  }
}
