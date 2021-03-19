import { Body, Controller, Get, HttpCode, Param, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContactCollegeResponsesService } from './contact-college-responses.service';
import { GetUser } from '../auth/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateProposalResponseDto } from './dto/create-proposal-response.dto';
import { ContactCollegesService } from '../contact-colleges/contact-colleges.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { COLLEGE_CONTACT_PROPOSALS_RESPONSE_FILES_PATH } from '../config/config';
import { ContactCollegesProposalResponsesListDto } from './dto/contact-colleges-proposals-list.dto';
import { ChatService } from '../chat/chat.service';
import { AddChatDto } from '../chat/dto/addChat.dto';

import * as fs from 'fs';
import ResponseHandler from '../common/ResponseHandler';
import { ContactCollegeProposalResponseIdDto } from '../common/dto/ContactCollegeProposalResponseId.dto';
import { ChatModuleEnum } from '../chat/dto/chatList.dto';
import { AddChatReplyDto } from '../chat/dto/addReply.dto';
import { setFilenameAndDestination, moveFilesToS3 } from '../s3upload/s3';

const sharp = require('sharp');

@ApiTags('Contact College Responses')
@Controller('contact-college-responses')
export class ContactCollegeResponsesController {
  constructor(
    private readonly collegeResponsesService: ContactCollegeResponsesService,
    private readonly contactCollegesService: ContactCollegesService,
    private readonly chatService: ChatService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async getProposalResponses(@Query() contactCollegesProposalResponsesListDto: ContactCollegesProposalResponsesListDto, @GetUser() user) {
    if (!user.collegeId && !user.employerId) {
      return ResponseHandler.fail('Unauthorized');
    }

    contactCollegesProposalResponsesListDto.collegeId = user.collegeId ? user.collegeId : null;
    contactCollegesProposalResponsesListDto.userId = user.collegeId ? user._id : null;
    contactCollegesProposalResponsesListDto.employerId = user.employerId ? user.employerId : null;
    contactCollegesProposalResponsesListDto.employerAdminId = user.employerId ? user._id : null;
    contactCollegesProposalResponsesListDto.employerAdminRole = user.employerId ? user.role : null;
    contactCollegesProposalResponsesListDto.sortBy = contactCollegesProposalResponsesListDto.sortBy
      ? contactCollegesProposalResponsesListDto.sortBy
      : 'createdAt';
    contactCollegesProposalResponsesListDto.sortOrder = contactCollegesProposalResponsesListDto.sortOrder === 'asc' ? '1' : '-1';
    contactCollegesProposalResponsesListDto.page = contactCollegesProposalResponsesListDto.page
      ? Number(contactCollegesProposalResponsesListDto.page)
      : 1;
    contactCollegesProposalResponsesListDto.perPage = contactCollegesProposalResponsesListDto.perPage
      ? Number(contactCollegesProposalResponsesListDto.perPage)
      : 10;
    contactCollegesProposalResponsesListDto.keyword = contactCollegesProposalResponsesListDto.keyword
      ? contactCollegesProposalResponsesListDto.keyword
      : '';
    contactCollegesProposalResponsesListDto.proposals = contactCollegesProposalResponsesListDto.proposals
      ? contactCollegesProposalResponsesListDto.proposals
      : [];

    return await this.collegeResponsesService.getProposalResponses(contactCollegesProposalResponsesListDto);
  }

  @Get('/details/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async getProposalResponseDetails(@Param() responseIdDto: ContactCollegeProposalResponseIdDto) {
    return await this.collegeResponsesService.getProposalResponseDetails(responseIdDto.id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Add contact college proposal response.' })
  @HttpCode(200)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments' }], {
      storage: diskStorage({
        destination: (req, file, cb) => {
          fs.mkdir('./public' + COLLEGE_CONTACT_PROPOSALS_RESPONSE_FILES_PATH, { recursive: true }, err => {
            if (err) {
              return ResponseHandler.fail(err.message);
            }
            cb(null, './public' + COLLEGE_CONTACT_PROPOSALS_RESPONSE_FILES_PATH);
          });
        },
        filename: (req, file, cb) => {
          let name = file.originalname.split('.');
          cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
        },
      }),
    }),
  )
  async createProposalResponse(@Body() createProposalResponseDto: CreateProposalResponseDto, @UploadedFiles() files, @GetUser() user) {
    if (!user.collegeId) {
      return ResponseHandler.fail('Unauthorized', '', 401);
    }

    const { data: proposal } = await this.contactCollegesService.getProposalById(createProposalResponseDto.proposal);
    if (proposal) {
      createProposalResponseDto.appliedBy = user._id;
      createProposalResponseDto.college = user.collegeId;

      if (files && files.attachments && files.attachments.length > 0) {
        createProposalResponseDto.attachments = files.attachments.map(attachment => ({
          path: `${COLLEGE_CONTACT_PROPOSALS_RESPONSE_FILES_PATH}${attachment.filename}`,
          filename: attachment.filename,
        }));

        // S3 uploads
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
          files = setFilenameAndDestination(COLLEGE_CONTACT_PROPOSALS_RESPONSE_FILES_PATH, files);
          // files.headerImage[0].buffer = fs.readFileSync(files.headerImage[0].path);
          await Promise.all(
            files.attachments.map(async attachment => {
              attachment.buffer = fs.readFileSync(attachment.path);
              return null;
            }),
          );

          moveFilesToS3(COLLEGE_CONTACT_PROPOSALS_RESPONSE_FILES_PATH, files);
        }
      }

      createProposalResponseDto.proposedBy = proposal.addedBy;

      if (!createProposalResponseDto.users.find(elem => elem === user._id.toString())) {
        createProposalResponseDto.users.push(user._id);
      }

      const chat: AddChatDto = {
        groupName: proposal.title,
        college: user.collegeId,
        employer: proposal.employer,
        users: createProposalResponseDto.users,
        employerAdmins: proposal.showToEmployerAdmins,
        createdBy: user._id,
        createdByType: 'user',
        course: null,
        learner: null,
        module: ChatModuleEnum.EMPLOYER_PROPOSAL_RESPONSE,
      };

      const { data: newChat } = await this.chatService.addChat(chat);

      const chatMessage: AddChatReplyDto = {
        chat: newChat._id,
        message: createProposalResponseDto.description,
        user: user._id,
        readByLearner: false,
        readByEmployerAdmins: [],
        readByUsers: [user._id],
      };

      const { data: newMessage } = await this.chatService.addChatReply(chatMessage);

      createProposalResponseDto.chat = newChat._id;
      const { data: newResponse, message } = await this.collegeResponsesService.createProposalResponse(
        createProposalResponseDto,
        proposal.employer,
      );

      await this.chatService.updateChatModuleDocumentId(newChat._id, newResponse._id);

      return ResponseHandler.success(newResponse, message);
    } else {
      return ResponseHandler.fail('Proposal not found.');
    }
  }
}
