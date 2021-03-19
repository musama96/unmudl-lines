"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
exports.default = {
    success(data = null, message = '', status = 200) {
        return {
            success: true,
            status,
            data,
            message,
        };
    },
    fail(message = '', error = null, status = 400) {
        throw new common_1.HttpException({
            status,
            message: message ? message : 'There was an error. Please try again later.',
            errors: error ? [error] : [],
        }, status);
    },
};
//# sourceMappingURL=ResponseHandler.js.map