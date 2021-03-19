"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openapi = require("@nestjs/swagger");
var ChatModuleEnum;
(function (ChatModuleEnum) {
    ChatModuleEnum["INTERNAL_CHAT"] = "internal-chat";
    ChatModuleEnum["EMPLOYER_PROPOSAL_RESPONSE"] = "employer-proposal-response";
    ChatModuleEnum["SOURCE_TALENT"] = "source-talent";
    ChatModuleEnum["ENQUIRIES"] = "enquiries";
})(ChatModuleEnum = exports.ChatModuleEnum || (exports.ChatModuleEnum = {}));
class ChatListDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { keyword: { required: false, type: () => String }, page: { required: false, type: () => Number }, perPage: { required: false, type: () => Number }, sortBy: { required: false, type: () => String }, sortOrder: { required: false, type: () => String }, archive: { required: false, type: () => Boolean }, myChatsOnly: { required: false, type: () => Boolean }, module: { required: false, enum: require("./chatList.dto").ChatModuleEnum }, moduleDocumentIds: { required: false, type: () => [String] } };
    }
}
exports.ChatListDto = ChatListDto;
//# sourceMappingURL=chatList.dto.js.map