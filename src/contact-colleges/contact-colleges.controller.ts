import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ContactCollegesService } from './contact-colleges.service';
import { CreateContactCollegeProposalDto } from './dto/create-contact-college-proposal.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { COLLEGE_CONTACT_PROPOSALS_FILES_PATH } from '../config/config';
import { GetUser } from '../auth/get-user.decorator';
import { CreateContactCollegeDraftProposalDto } from './dto/create-contact-college-draft-proposal.dto';
import { ContactCollegeProposalIdDto } from '../common/dto/contactCollegeProposalId.dto';
import { ContactCollegesProposalsListDto } from './dto/contact-colleges-proposals-list.dto';
import { UpdateContactCollegeProposalDto } from './dto/update-contact-college-proposal.dto';
import { UpdateContactCollegeDraftProposalDto } from './dto/update-contact-college-draft-proposal.dto';

import ResponseHandler from '../common/ResponseHandler';
import * as fs from 'fs';
import { setFilenameAndDestination, moveFilesToS3 } from '../s3upload/s3';

const sharp = require('sharp');

@ApiTags('Contact Colleges')
@Controller('contact-colleges')
export class ContactCollegesController {
  constructor(private readonly contactCollegesService: ContactCollegesService) {}

  @ApiOperation({ summary: 'Get sorted and paginated list of contact college proposals.' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get()
  async getProposals(@Query() listDto: ContactCollegesProposalsListDto, @GetUser() user) {
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.page = listDto.page ? listDto.page : 1;
    listDto.perPage = listDto.perPage ? listDto.perPage : 10;
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
    if (user.collegeId) {
      listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
      listDto.userId = user._id;
      return await this.contactCollegesService.getProposalsForCollege(listDto);
    } else if (user.employerId) {
      listDto.employerId = user.employerId ? user.employerId : listDto.employerId;
      listDto.employerAdminId = user._id;
      return await this.contactCollegesService.getProposalsForEmployer(listDto, user);
    } else {
      return ResponseHandler.fail('Unauthorized', '', 401);
    }
  }

  @ApiOperation({ summary: 'Get contact college proposals details.' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('/details/:id')
  async getProposalDetails(@Param() contactCollegeProposalIdDto: ContactCollegeProposalIdDto, @GetUser() user) {
    if (user.collegeId) {
      return await this.contactCollegesService.getProposalDetailsForCollege(contactCollegeProposalIdDto.id);
    } else if (user.employerId) {
      return await this.contactCollegesService.getProposalDetailsForEmployer(contactCollegeProposalIdDto.id);
    } else {
      return ResponseHandler.fail('Unauthorized', '', 401);
    }
  }

  @ApiOperation({ summary: 'Create new contact college proposal.' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post()
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments' }], {
      storage: diskStorage({
        destination: (req, file, cb) => {
          fs.mkdir('./public' + COLLEGE_CONTACT_PROPOSALS_FILES_PATH, { recursive: true }, err => {
            if (err) {
              return ResponseHandler.fail(err.message);
            }
            cb(null, './public' + COLLEGE_CONTACT_PROPOSALS_FILES_PATH);
          });
        },
        filename: (req, file, cb) => {
          let name = file.originalname.split('.');
          cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
        },
      }),
    }),
  )
  async createProposal(@Body() createContactCollegeProposalDto: CreateContactCollegeProposalDto, @UploadedFiles() files, @GetUser() user) {
    createContactCollegeProposalDto.addedBy = user._id;
    createContactCollegeProposalDto.employer = user.employerId;
    if (files && files.attachments && files.attachments.length > 0) {
      createContactCollegeProposalDto.attachments = files.attachments.map(attachment => ({
        path: `${COLLEGE_CONTACT_PROPOSALS_FILES_PATH}${attachment.filename}`,
        filename: attachment.filename,
      }));

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(COLLEGE_CONTACT_PROPOSALS_FILES_PATH, files);
        // files.headerImage[0].buffer = fs.readFileSync(files.headerImage[0].path);
        await Promise.all(
          files.attachments.map(async attachment => {
            attachment.buffer = fs.readFileSync(attachment.path);
            return null;
          }),
        );

        moveFilesToS3(COLLEGE_CONTACT_PROPOSALS_FILES_PATH, files);
      }
    } else if (createContactCollegeProposalDto.emptyAttachments) {
      createContactCollegeProposalDto.attachments = [];
    } else {
      delete createContactCollegeProposalDto.attachments;
    }

    if (!createContactCollegeProposalDto.showToEmployerAdmins) {
      createContactCollegeProposalDto.showToEmployerAdmins = [user._id];
    } else if (!createContactCollegeProposalDto.showToEmployerAdmins.find(id => id.toString() === user._id.toString())) {
      createContactCollegeProposalDto.showToEmployerAdmins.push(user._id);
    }

    return await this.contactCollegesService.createProposal(createContactCollegeProposalDto, user);
  }

  @ApiOperation({ summary: 'Update contact college proposal.' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('/update/:id')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments' }], {
      storage: diskStorage({
        destination: (req, file, cb) => {
          fs.mkdir('./public' + COLLEGE_CONTACT_PROPOSALS_FILES_PATH, { recursive: true }, err => {
            if (err) {
              return ResponseHandler.fail(err.message);
            }
            cb(null, './public' + COLLEGE_CONTACT_PROPOSALS_FILES_PATH);
          });
        },
        filename: (req, file, cb) => {
          let name = file.originalname.split('.');
          cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
        },
      }),
    }),
  )
  async updateProposal(
    @UploadedFiles() files,
    @Param() contactCollegeProposalIdDto: ContactCollegeProposalIdDto,
    @Body() updateContactCollegeProposalDto: UpdateContactCollegeProposalDto,
    @GetUser() user,
  ) {
    updateContactCollegeProposalDto.addedBy = user._id;
    updateContactCollegeProposalDto.employer = user.employerId;
    updateContactCollegeProposalDto.attachments = [];
    if (updateContactCollegeProposalDto.previousAttachments.length > 0) {
      updateContactCollegeProposalDto.attachments = updateContactCollegeProposalDto.previousAttachments.map((attachment: any) => {
        const dirs = typeof attachment === 'string' ? attachment.split('/') : [];
        return {
          path: attachment.path ? attachment.path : attachment,
          filename: attachment.filename ? attachment.filename : dirs[dirs.length - 1],
        };
      });
    }
    if (files && files.attachments && files.attachments.length > 0) {
      files.attachments.map(attachment =>
        updateContactCollegeProposalDto.attachments.push({
          path: `${COLLEGE_CONTACT_PROPOSALS_FILES_PATH}${attachment.filename}`,
          filename: attachment.filename,
        }),
      );

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(COLLEGE_CONTACT_PROPOSALS_FILES_PATH, files);
        // files.headerImage[0].buffer = fs.readFileSync(files.headerImage[0].path);
        await Promise.all(
          files.attachments.map(async attachment => {
            attachment.buffer = fs.readFileSync(attachment.path);
            return null;
          }),
        );

        moveFilesToS3(COLLEGE_CONTACT_PROPOSALS_FILES_PATH, files);
      }
    } else if (updateContactCollegeProposalDto.emptyAttachments) {
      updateContactCollegeProposalDto.attachments = [];
    }

    if (!updateContactCollegeProposalDto.showToEmployerAdmins) {
      updateContactCollegeProposalDto.showToEmployerAdmins = [user._id];
    } else if (!updateContactCollegeProposalDto.showToEmployerAdmins.find(id => id.toString() === user._id.toString())) {
      updateContactCollegeProposalDto.showToEmployerAdmins.push(user._id);
    }

    return await this.contactCollegesService.updateProposal(contactCollegeProposalIdDto.id, updateContactCollegeProposalDto);
  }

  @ApiOperation({ summary: 'Disable draft proposal.' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async disableProposal(@Param() contactCollegeProposalIdDto: ContactCollegeProposalIdDto) {
    return await this.contactCollegesService.disableProposal(contactCollegeProposalIdDto.id);
  }

  @ApiOperation({ summary: 'Invert proposal status.' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('/invert-status/:id')
  async invertProposalStatus(@Param() contactCollegeProposalIdDto: ContactCollegeProposalIdDto) {
    return await this.contactCollegesService.invertProposalStatus(contactCollegeProposalIdDto.id);
  }

  @ApiOperation({ summary: 'Get sorted and paginated list of contact college draft proposals.' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('draft')
  async getDraftProposals(@Query() listDto: ContactCollegesProposalsListDto, @GetUser() user) {
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.page = listDto.page ? listDto.page : 1;
    listDto.perPage = listDto.perPage ? listDto.perPage : 10;
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
    listDto.employerAdminId = user._id;

    return await this.contactCollegesService.getDraftProposals(listDto, user);
  }

  @ApiOperation({ summary: 'Get contact college proposals details.' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('/draft/details/:id')
  async getDraftProposalDetails(@Param() contactCollegeProposalIdDto: ContactCollegeProposalIdDto) {
    return await this.contactCollegesService.getDraftProposalDetails(contactCollegeProposalIdDto.id);
  }

  @ApiOperation({ summary: 'Create new contact college draft proposal.' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('draft')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments' }], {
      storage: diskStorage({
        destination: (req, file, cb) => {
          fs.mkdir('./public' + COLLEGE_CONTACT_PROPOSALS_FILES_PATH, { recursive: true }, err => {
            if (err) {
              return ResponseHandler.fail(err.message);
            }
            cb(null, './public' + COLLEGE_CONTACT_PROPOSALS_FILES_PATH);
          });
        },
        filename: (req, file, cb) => {
          let name = file.originalname.split('.');
          cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
        },
      }),
    }),
  )
  async createDraftProposal(
    @Body() createContactCollegeProposalDto: CreateContactCollegeDraftProposalDto,
    @UploadedFiles() files,
    @GetUser() user,
  ) {
    createContactCollegeProposalDto.addedBy = user._id;
    createContactCollegeProposalDto.employer = user.employerId;

    if (files && files.attachments && files.attachments.length > 0) {
      createContactCollegeProposalDto.attachments = files.attachments.map(attachment => ({
        path: `${COLLEGE_CONTACT_PROPOSALS_FILES_PATH}${attachment.filename}`,
        filename: attachment.filename,
      }));

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(COLLEGE_CONTACT_PROPOSALS_FILES_PATH, files);
        // files.headerImage[0].buffer = fs.readFileSync(files.headerImage[0].path);
        await Promise.all(
          files.attachments.map(async attachment => {
            attachment.buffer = fs.readFileSync(attachment.path);
            return null;
          }),
        );

        moveFilesToS3(COLLEGE_CONTACT_PROPOSALS_FILES_PATH, files);
      }
    } else if (createContactCollegeProposalDto.emptyAttachments) {
      createContactCollegeProposalDto.attachments = [];
    } else {
      delete createContactCollegeProposalDto.attachments;
    }

    return await this.contactCollegesService.createDraftProposal(createContactCollegeProposalDto);
  }

  @ApiOperation({ summary: 'Update contact college draft proposal.' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('/draft/update/:id')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments' }], {
      storage: diskStorage({
        destination: (req, file, cb) => {
          fs.mkdir('./public' + COLLEGE_CONTACT_PROPOSALS_FILES_PATH, { recursive: true }, err => {
            if (err) {
              return ResponseHandler.fail(err.message);
            }
            cb(null, './public' + COLLEGE_CONTACT_PROPOSALS_FILES_PATH);
          });
        },
        filename: (req, file, cb) => {
          let name = file.originalname.split('.');
          cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
        },
      }),
    }),
  )
  async updateDraftProposal(
    @Param() contactCollegeProposalIdDto: ContactCollegeProposalIdDto,
    @Body() updateContactCollegeDraftProposalDto: UpdateContactCollegeDraftProposalDto,
    @UploadedFiles() files,
    @GetUser() user,
  ) {
    updateContactCollegeDraftProposalDto.addedBy = user._id;
    updateContactCollegeDraftProposalDto.employer = user.employerId;

    updateContactCollegeDraftProposalDto.attachments = [];
    if (updateContactCollegeDraftProposalDto.previousAttachments.length > 0) {
      updateContactCollegeDraftProposalDto.attachments = updateContactCollegeDraftProposalDto.previousAttachments.map((attachment: any) => {
        const dirs = typeof attachment === 'string' ? attachment.split('/') : [];
        return {
          path: attachment.path ? attachment.path : attachment,
          filename: attachment.filename ? attachment.filename : dirs[dirs.length - 1],
        };
      });
    }
    if (files && files.attachments && files.attachments.length > 0) {
      files.attachments.map(attachment =>
        updateContactCollegeDraftProposalDto.attachments.push({
          path: `${COLLEGE_CONTACT_PROPOSALS_FILES_PATH}${attachment.filename}`,
          filename: attachment.filename,
        }),
      );

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(COLLEGE_CONTACT_PROPOSALS_FILES_PATH, files);
        // files.headerImage[0].buffer = fs.readFileSync(files.headerImage[0].path);
        await Promise.all(
          files.attachments.map(async attachment => {
            attachment.buffer = fs.readFileSync(attachment.path);
            return null;
          }),
        );

        moveFilesToS3(COLLEGE_CONTACT_PROPOSALS_FILES_PATH, files);
      }
    } else if (updateContactCollegeDraftProposalDto.emptyAttachments) {
      updateContactCollegeDraftProposalDto.attachments = [];
    }

    return await this.contactCollegesService.updateDraftProposal(contactCollegeProposalIdDto.id, updateContactCollegeDraftProposalDto);
  }

  @ApiOperation({ summary: 'Disable draft proposal.' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete('/draft/:id')
  async disableDraftProposal(@Param() contactCollegeProposalIdDto: ContactCollegeProposalIdDto) {
    return await this.contactCollegesService.disableDraftProposal(contactCollegeProposalIdDto.id);
  }
}
