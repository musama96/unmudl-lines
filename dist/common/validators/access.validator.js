"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const responseMessages_1 = require("../../config/responseMessages");
function isAuthorized(userToUpdate, requestingUser) {
    if (userToUpdate.role === 'superadmin') {
        return { isAuthorized: false, msg: responseMessages_1.default.access.superadmin };
    }
    else if (requestingUser.collegeId && userToUpdate.collegeId.toString() !== requestingUser.collegeId.toString()) {
        return { isAuthorized: false, msg: responseMessages_1.default.access.college };
    }
    else if (requestingUser.employerId && userToUpdate.employerId.toString() !== requestingUser.employerId.toString()) {
        return { isAuthorized: false, msg: responseMessages_1.default.access.employer };
    }
    else if ((userToUpdate.role === 'admin' && (requestingUser.role === 'manager' || requestingUser.role === 'moderator')) ||
        (userToUpdate.role === 'manager' && requestingUser.role === 'moderator')) {
        return { isAuthorized: false, msg: responseMessages_1.default.access.higherRole };
    }
    else {
        return { isAuthorized: true };
    }
}
exports.isAuthorized = isAuthorized;
//# sourceMappingURL=access.validator.js.map