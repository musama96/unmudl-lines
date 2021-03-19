import { Body, Controller, Get, HttpCode, Param, Post, Query, UploadedFiles, UseGuards, UseInterceptors, Delete } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { AddChatDto } from './dto/addChat.dto';
import { GetUser } from '../auth/get-user.decorator';
import { AddChatReplyDto } from './dto/addReply.dto';
import { ChatListDto, ChatModuleEnum } from './dto/chatList.dto';
import { AddMembersDto } from './dto/addMembers.dto';
import { GetMembersDto } from './dto/getMembers.dto';
import { ChatIdDto } from '../common/dto/chatId.dto';
import { ChatType } from './chat.model';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CHAT_FILES_PATH } from '../config/config';

import ResponseHandler from '../common/ResponseHandler';
import * as fs from 'fs';
import { ArchiveChatDto } from './dto/archiveChat.dto';
import { moveFilesToS3, setFilenameAndDestination } from '../s3upload/s3';
import { SourceTalentChatListDto } from './dto/sourceTalentChatList.dto';
const sharp = require('sharp');

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chats for a user.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('members')
  async getMembersForChat(@Query() getMembersDto: GetMembersDto, @GetUser() user) {
    getMembersDto.keyword = getMembersDto.keyword ? getMembersDto.keyword : '';
    getMembersDto.perPage = Number(getMembersDto.perPage) ? getMembersDto.perPage : 7;
    getMembersDto.type = getMembersDto.type ? getMembersDto.type : ChatType.COLLEGE;

    return await this.chatService.getMembersForChat(getMembersDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add chat.' })
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiConsumes('application/x-www-form-urlencoded')
  @HttpCode(200)
  async addChat(@Body() addChatDto: AddChatDto, @GetUser() user) {
    switch (user.type) {
      case 'learner':
        addChatDto.learner = user._id;
        addChatDto.users = addChatDto.users ? addChatDto.users : [];
        addChatDto.employerAdmins = addChatDto.employerAdmins ? addChatDto.employerAdmins : [];
        addChatDto.createdByType = 'learner';
        addChatDto.type = ChatType.LEARNER;
        break;
      case 'user':
        addChatDto.learner = addChatDto.learner ? addChatDto.learner : null;
        addChatDto.users = addChatDto.users ? [...addChatDto.users, user._id] : [user._id];
        addChatDto.employerAdmins = addChatDto.employerAdmins ? addChatDto.employerAdmins : [];
        addChatDto.createdByType = 'user';
        addChatDto.type = user.collegeId ? ChatType.COLLEGE : addChatDto.type ? addChatDto.type : ChatType.COLLEGE;
        break;
      case 'employer':
        addChatDto.learner = addChatDto.learner ? addChatDto.learner : null;
        addChatDto.users = addChatDto.users ? addChatDto.users : [];
        addChatDto.employerAdmins = addChatDto.employerAdmins ? [...addChatDto.employerAdmins, user._id] : [user._id];
        addChatDto.createdByType = 'employerAdmin';
        addChatDto.type = ChatType.EMPLOYER;
        break;
    }
    addChatDto.createdBy = user._id;

    return await this.chatService.addChat(addChatDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reply to a chat.' })
  @Post('reply')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiConsumes('multipart/form-data')
  @HttpCode(200)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments' }], {
      storage: diskStorage({
        destination: (req, file, cb) => {
          fs.mkdir('./public' + CHAT_FILES_PATH, { recursive: true }, err => {
            if (err) {
              return ResponseHandler.fail(err.message);
            }
            cb(null, './public' + CHAT_FILES_PATH);
          });
        },
        filename: (req, file, cb) => {
          let name = file.originalname.split('.');
          cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
        },
      }),
    }),
  )
  async addChatReply(@Body() addReplyDto: AddChatReplyDto, @GetUser() user, @UploadedFiles() files) {
    const { data: chat } = await this.chatService.getChatById(addReplyDto.chat, true, false);

    if (addReplyDto.showToCreator) {
      await this.chatService.updateShowToCreator(addReplyDto.chat, true);
    }

    if (chat) {
      if (files && files.attachments && files.attachments.length > 0) {
        addReplyDto.attachments = files.attachments.map(attachment => `${CHAT_FILES_PATH}${attachment.filename}`);

        // S3 uploads
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
          files = setFilenameAndDestination(CHAT_FILES_PATH, files);
          // files.headerImage[0].buffer = fs.readFileSync(files.headerImage[0].path);
          await Promise.all(
            files.attachments.map(async attachment => {
              attachment.buffer = fs.readFileSync(attachment.path);
              return null;
            }),
          );

          moveFilesToS3(CHAT_FILES_PATH, files);
        }
      }

      switch (user.type) {
        case 'learner':
          if (user._id.toString() === chat.learner.toString()) {
            addReplyDto.readByLearner = true;
            addReplyDto.learner = user._id;
          } else {
            return ResponseHandler.fail('You are not a part of this chat group.');
          }
          break;
        case 'user':
          if (chat.users.map(chatUser => chatUser.toString()).includes(user._id.toString())) {
            addReplyDto.readByUsers = [user._id];
            addReplyDto.user = user._id;
          } else {
            return ResponseHandler.fail('You are not a part of this chat group.');
          }
          break;
        case 'employer':
          if (chat.employerAdmins.map(employerAdmin => employerAdmin.toString()).includes(user._id.toString())) {
            addReplyDto.readByEmployerAdmins = [user._id];
            addReplyDto.employerAdmin = user._id;
          } else {
            return ResponseHandler.fail('You are not a part of this chat group.');
          }
          break;
      }

      return await this.chatService.addChatReply(addReplyDto);
    } else {
      return ResponseHandler.fail('Chat does not exist.');
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chats for a user.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get()
  async getChatsForAUser(@Query() chatListDto: ChatListDto, @GetUser() user) {
    chatListDto.keyword = chatListDto.keyword ? chatListDto.keyword : '';
    chatListDto.page = Number(chatListDto.page) ? chatListDto.page : 1;
    chatListDto.perPage = Number(chatListDto.perPage) ? chatListDto.perPage : 10;
    chatListDto.sortOrder = chatListDto.sortOrder === 'asc' ? '1' : '-1';
    chatListDto.sortBy = chatListDto.sortBy ? chatListDto.sortBy : 'createdAt';
    chatListDto.archive = chatListDto.archive ? chatListDto.archive : false;
    chatListDto.module = chatListDto.module ? chatListDto.module : null;
    chatListDto.moduleDocumentIds = chatListDto.moduleDocumentIds?.length > 0 ? chatListDto.moduleDocumentIds : [];

    return await this.chatService.getChatsForAUser(chatListDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chats for a user.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('source-talents')
  async getSourceTalentChatsForAUser(@Query() chatListDto: SourceTalentChatListDto, @GetUser() user) {
    chatListDto.keyword = chatListDto.keyword ? chatListDto.keyword : '';
    chatListDto.page = Number(chatListDto.page) ? chatListDto.page : 1;
    chatListDto.perPage = Number(chatListDto.perPage) ? chatListDto.perPage : 10;
    chatListDto.sortOrder = chatListDto.sortOrder === 'asc' ? '1' : '-1';
    chatListDto.sortBy = chatListDto.sortBy ? chatListDto.sortBy : 'createdAt';
    chatListDto.archive = chatListDto.archive ? chatListDto.archive : false;

    return await this.chatService.getSourceTalentChatsForAUser(chatListDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chat details.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get(':id')
  async getChatDetails(@Param() chatIdDto: ChatIdDto, @GetUser() user) {
    return await this.chatService.getChatDetails(chatIdDto.id, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete chat.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  async deleteChat(@Param() chatIdDto: ChatIdDto, @GetUser() user) {
    return await this.chatService.deleteChat(chatIdDto.id, user._id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add members to a chat.' })
  @Post('add-members')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiConsumes('application/x-www-form-urlencoded')
  async addMembersToChat(@Body() addMembersDto: AddMembersDto, @GetUser() user) {
    return await this.chatService.addMembersToChat(addMembersDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize contact unmudl chats for a user.' })
  @Post('init-contact-unmudl')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiConsumes('application/x-www-form-urlencoded')
  async initializeContactUnmudlChats(@GetUser() user) {
    if (!user.employerId) {
      return ResponseHandler.fail('Unauthorized', null, 401);
    }

    return await this.chatService.initializeContactUnmudlChats(user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add chat to archive.' })
  @Post('archive')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiConsumes('application/x-www-form-urlencoded')
  async addChatToArchive(@Body() archiveChatDto: ArchiveChatDto, @GetUser() user) {
    return await this.chatService.addChatToArchive(archiveChatDto, user);
  }
}
