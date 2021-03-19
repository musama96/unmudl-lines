import { Body, Controller, Get, HttpCode, Post, Query, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { EmployerEnquiriesService } from './employer-enquiries.service';
import { GetUser } from '../auth/get-user.decorator';
import { GetEnquiryMessagesDto } from './dto/getEnquiryMessages.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AddUserEnquiryDto } from './dto/addUserEnquiry.dto';
import { AddEnquiryMembersDto } from '../enquiries/dto/addMembers.dto';
import { MessageIdDto } from './dto/messageId.dto';
import { ChatIdDto } from './dto/chatIdDto';
import { AddEmployerEnquiryDto } from './dto/addEmployerEnquiry.dto';
import ResponseHandler from '../common/ResponseHandler';

@ApiTags('Employer Enquiries')
@Controller('employer-enquiries')
export class EmployerEnquiriesController {
  constructor(private readonly employerEnquiriesService: EmployerEnquiriesService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new enquiry or reply to existing one.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post()
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  async AddEnquiryMessage(@Body() addEmployerEnquiryDto: AddEmployerEnquiryDto, @GetUser() user) {
    if (user.type !== 'employer') {
      return ResponseHandler.fail('Only employers are allowed to initiate a chat.');
    }

    addEmployerEnquiryDto.employerAdminId = user._id;

    return await this.employerEnquiriesService.addEmployerEnquiryMessage(addEmployerEnquiryDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get enquiries.' })
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator', 'instructor')
  async GetEnquiries(@GetUser() user) {
    return await this.employerEnquiriesService.getUserEnquiries(user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get chat group details.' })
  @Get('detail/:chatId')
  async GetChatGroupDetail(@Param() chatIdDto: ChatIdDto, @GetUser() user) {
    chatIdDto.user = user.type !== 'user' ? null : user;
    chatIdDto.employerAdminId = user.type !== 'employer' ? null : user._id;

    return await this.employerEnquiriesService.getChatGroupDetail(chatIdDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get enquiry messages.' })
  @Get('messages')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator', 'instructor')
  async GetEnquiryMessages(@Query() getEnquiryMessagesDto: GetEnquiryMessagesDto, @GetUser() user) {
    getEnquiryMessagesDto.page = getEnquiryMessagesDto.page ? Number(getEnquiryMessagesDto.page) : 1;
    getEnquiryMessagesDto.perPage = getEnquiryMessagesDto.perPage ? Number(getEnquiryMessagesDto.perPage) : 8;
    getEnquiryMessagesDto.userId = user.type !== 'user' ? null : user._id;
    getEnquiryMessagesDto.employerAdminId = user.type !== 'employer' ? null : user._id;
    getEnquiryMessagesDto.isAdmin = user.role.includes('admin');

    return await this.employerEnquiriesService.getEnquiryMessages(getEnquiryMessagesDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add enquiries reply.' })
  @Post('admin-reply')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator', 'instructor')
  @ApiConsumes('application/x-www-form-urlencoded')
  async AddAdminEnquiryReply(@Body() addUserEnquiryDto: AddUserEnquiryDto, @GetUser() user) {
    if (user.type === 'employer') {
      return ResponseHandler.fail('Only unmudl or college admins are allowed to access this api.');
    }
    addUserEnquiryDto.user = user;

    return await this.employerEnquiriesService.addUserEnquiry(addUserEnquiryDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add members to an enquiry.' })
  @Post('add-members')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiConsumes('application/x-www-form-urlencoded')
  async AddEnquiryMembers(@Body() addMembersDto: AddEnquiryMembersDto, @GetUser() user) {
    return await this.employerEnquiriesService.addMembers(addMembersDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update ready by.' })
  @Post('update-readBy')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async UpdateReadBy(@Body() messageIdDto: MessageIdDto, @GetUser() user) {
    messageIdDto.userId = user.type !== 'user' ? null : user._id;
    messageIdDto.employerAdminId = user.type !== 'employer' ? null : user._id;

    return await this.employerEnquiriesService.updateReadBy(messageIdDto);
  }
}
