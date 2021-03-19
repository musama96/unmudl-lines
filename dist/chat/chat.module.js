"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const chat_controller_1 = require("./chat.controller");
const chat_service_1 = require("./chat.service");
const mongoose_1 = require("@nestjs/mongoose");
const chat_model_1 = require("./chat.model");
const message_model_1 = require("./message.model");
const notifications_module_1 = require("../notifications/notifications.module");
const user_model_1 = require("../users/user.model");
const employer_admin_model_1 = require("../employer-admins/employer-admin.model");
let ChatModule = class ChatModule {
};
ChatModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'chats', schema: chat_model_1.ChatSchema },
                { name: 'messages', schema: message_model_1.MessageSchema },
                { name: 'users', schema: user_model_1.UserSchema },
                { name: 'employer-admins', schema: employer_admin_model_1.EmployerAdminSchema },
            ]),
            common_1.forwardRef(() => notifications_module_1.NotificationsModule),
        ],
        controllers: [chat_controller_1.ChatController],
        providers: [chat_service_1.ChatService],
        exports: [chat_service_1.ChatService],
    })
], ChatModule);
exports.ChatModule = ChatModule;
//# sourceMappingURL=chat.module.js.map