"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.UserActivities = {
    UploadCourse: 'uploadCourse',
    DeleteCourse: 'deleteCourse',
    UpdateCourse: 'updateCourse',
    AddUser: 'addUser',
    InvitedUser: 'invitedUser',
    UserJoined: 'userJoined',
};
exports.UserActivityCategorySchema = new mongoose.Schema({
    name: { type: String, enum: ['uploadCourse', 'deleteCourse', 'updateCourse', 'addUser'], required: true },
    color: { type: String, required: true },
}, {
    timestamps: true,
});
exports.UserActivityCategorySchema.query.byName = function (name) {
    return this.where({
        name,
    });
};
//# sourceMappingURL=userActivityCategory.model.js.map