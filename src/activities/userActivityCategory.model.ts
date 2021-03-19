import * as mongoose from 'mongoose';

export const UserActivities = {
  UploadCourse: 'uploadCourse',
  DeleteCourse: 'deleteCourse',
  UpdateCourse: 'updateCourse',
  AddUser: 'addUser',
  InvitedUser: 'invitedUser',
  UserJoined: 'userJoined',
};

export const UserActivityCategorySchema = new mongoose.Schema(
  {
    name: {type: String, enum: ['uploadCourse', 'deleteCourse', 'updateCourse', 'addUser'], required: true},
    color: {type: String, required: true},
  },
  {
    timestamps: true,
  },
);

UserActivityCategorySchema.query.byName = function(name) {
  return this.where({
    name,
  });
};
