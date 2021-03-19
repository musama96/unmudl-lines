import { Controller, UseGuards, HttpCode, Post, Body, Query, Get, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiProperty, ApiOperation } from '@nestjs/swagger';
import { InternalChatService } from './internal-chat.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateChatGroupDto } from './dto/createChatGroup.dto';
import { GetUser } from '../auth/get-user.decorator';
import { SendMessageDto } from './dto/sendMessage.dto';
import { AddMembersDto } from './dto/addMembers.dto';
import { GetMessagesDto } from './dto/getMessages.dto';
import { ChatIdDto } from './dto/chatIdDto';
import { MessageIdDto } from './dto/messageId.dto';

@ApiTags('Internal chat')
@Controller('internal-chat')
export class InternalChatController {
  constructor(private readonly internalChatService: InternalChatService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'create a new chat group.' })
  @Post('chatGroup')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async CreateNewChatGroup(@Body() createChatGroupDto: CreateChatGroupDto, @GetUser() user) {
    // createChatGroupDto.groupName = createChatGroupDto.groupName ? createChatGroupDto.groupName : user.fullname;
    createChatGroupDto.members.push(user._id);
    createChatGroupDto.createdBy = user._id;
    createChatGroupDto.groupPhoto = user.profilePhotoThumbnail ? user.profilePhotoThumbnail : user.profilePhoto;

    return await this.internalChatService.createChatGroup(createChatGroupDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'send a new message in a chat group.' })
  @Post('message')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async SendNewMessage(@Body() sendMessageDto: SendMessageDto, @GetUser() user) {
    sendMessageDto.from = user._id;

    return await this.internalChatService.sendMessage(sendMessageDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'send a new message in a chat group.' })
  @Post('add-members')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async AddMembers(@Body() addMembersDto: AddMembersDto, @GetUser() user) {
    return await this.internalChatService.addMembers(addMembersDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'send a new message in a chat group.' })
  @Post('update-readBy')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async UpdateReadBy(@Body() messageIdDto: MessageIdDto, @GetUser() user) {
    messageIdDto.userId = user._id;

    return await this.internalChatService.updateReadBy(messageIdDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'send a new message in a chat group.' })
  @Get('chatGroups')
  async GetChatGroups(@GetUser() user) {
    return await this.internalChatService.getChatGroups(user._id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'send a new message in a chat group.' })
  @Get('chatGroup/detail/:chatId')
  async GetChatGroupDetail(@Param() chatIdDto: ChatIdDto, @GetUser() user) {
    chatIdDto.userId = user._id;

    return await this.internalChatService.getChatGroupDetail(chatIdDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'send a new message in a chat group.' })
  @Get('messages')
  async GetMessages(@Query() getMessagesDto: GetMessagesDto, @GetUser() user) {
    getMessagesDto.page = getMessagesDto.page ? Number(getMessagesDto.page) : 1;
    getMessagesDto.perPage = getMessagesDto.perPage ? Number(getMessagesDto.perPage) : 8;
    getMessagesDto.userId = user._id;

    return await this.internalChatService.getMessages(getMessagesDto);
  }
}
