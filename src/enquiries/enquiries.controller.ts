import { Body, Controller, Get, HttpCode, Post, Query, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { EnquiriesService } from './enquiries.service';
import { GetUser } from '../auth/get-user.decorator';
import { GetEnquiryMessagesDto } from './dto/getEnquiryMessages.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AddUserEnquiryDto } from './dto/addUserEnquiry.dto';
import { AddEnquiryMembersDto } from './dto/addMembers.dto';
import { MessageIdDto } from '../internal-chat/dto/messageId.dto';
import { ChatIdDto } from '../internal-chat/dto/chatIdDto';
import ResponseHandler from '../common/ResponseHandler';

@ApiTags('Enquiries')
@Controller('enquiries')
export class EnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get enquiries.' })
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator', 'instructor')
  async GetEnquiries(@GetUser() user) {
    return await this.enquiriesService.getUserEnquiries(user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'send a new message in a chat group.' })
  @Get('detail/:chatId')
  async GetChatGroupDetail(@Param() chatIdDto: ChatIdDto, @GetUser() user) {
    if (user.type !== 'learner' && !user.collegeId) {
      return ResponseHandler.fail('Only for college users.');
    }
    chatIdDto.user = user.type !== 'user' ? null : user;
    chatIdDto.learnerId = user.type !== 'learner' ? null : user._id;

    return await this.enquiriesService.getChatGroupDetail(chatIdDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get enquiries.' })
  @Get('messages')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator', 'instructor')
  async GetEnquiryMessages(@Query() getEnquiryMessagesDto: GetEnquiryMessagesDto, @GetUser() user) {
    getEnquiryMessagesDto.page = getEnquiryMessagesDto.page ? Number(getEnquiryMessagesDto.page) : 1;
    getEnquiryMessagesDto.perPage = getEnquiryMessagesDto.perPage ? Number(getEnquiryMessagesDto.perPage) : 8;
    getEnquiryMessagesDto.userId = user._id;
    getEnquiryMessagesDto.isAdmin = !(user.role !== 'superadmin' && user.role !== 'admin');

    return await this.enquiriesService.getEnquiryMessages(getEnquiryMessagesDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add enquiries reply.' })
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator', 'instructor')
  @ApiConsumes('application/x-www-form-urlencoded')
  async AddEnquiryReply(@Body() addUserEnquiryDto: AddUserEnquiryDto, @GetUser() user) {
    addUserEnquiryDto.user = user;

    return await this.enquiriesService.addUserEnquiry(addUserEnquiryDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add enquiries reply.' })
  @Post('add-members')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiConsumes('application/x-www-form-urlencoded')
  async AddEnquiryMembers(@Body() addMembersDto: AddEnquiryMembersDto, @GetUser() user) {
    return await this.enquiriesService.addMembers(addMembersDto, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'send a new message in a chat group.' })
  @Post('update-readBy')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async UpdateReadBy(@Body() messageIdDto: MessageIdDto, @GetUser() user) {
    messageIdDto.userId = user.type !== 'user' ? null : user._id;
    messageIdDto.learnerId = user.type !== 'learner' ? null : user._id;

    return await this.enquiriesService.updateReadBy(messageIdDto);
  }

  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Creaty a new enquiry.' })
  // @Post('/')
  // @HttpCode(200)
  // @UseGuards(AuthGuard('jwt'))
  // @ApiConsumes('application/x-www-form-urlencoded')
  // async createNewEnquiry(
  //   @Body() newEnquiryDto: NewEnquiryDto,
  //   @GetUser() user,
  // ) {
  //   if (user.type !== 'learner') {
  //     newEnquiryDto.from = MessageFrom.ADMIN;
  //     newEnquiryDto.collegeRep = user._id;
  //   } else {
  //     newEnquiryDto.from = MessageFrom.USER;
  //   }
  //   newEnquiryDto.status = MessageStatus.UNREAD;
  //   return await this.enquiriesService.createEnquiry(newEnquiryDto);
  // }

  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Get enquiries.' })
  // @Get('/')
  // @HttpCode(200)
  // @UseGuards(AuthGuard('jwt'))
  // async getEnquiries(@Query() getEnquiriesDto: GetEnquiriesDto) {
  //   return await this.enquiriesService.getEnquiries(getEnquiriesDto);
  // }
}
