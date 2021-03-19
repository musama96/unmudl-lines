import * as mongoose from 'mongoose';

export const CourseSuggestionSchema = new mongoose.Schema(
  {
    // firstname: {type: String, required: true, trim: true},
    // lastname: {type: String, required: true, trim: true},
    // emailAddress: {type: String, required: true, trim: true, lowercase: true},
    // phoneNumber: {type: String, required: true, trim: true},
    courseName: {type: String, required: true, trim: true},
    collegeName: {type: String, required: true, trim: true},
    isCourseCurrentlyOffered: {type: Boolean, default: true},
    moreInfo: {type: String, required: false, trim: true},
    contactInfo: {type: String, required: false, trim: true},
    status: {type: String, default: 'pending'},
  },
  {
    timestamps: true,
  },
);

// CollegeSuggestionSchema.query.byTitle = function(keyword) {
//   return this.where({ title: { $regex: keyword, $options: 'i' } });
// };

// CollegeSuggestionSchema.query.byCollege = function(collegeId) {
//   return this.where({ collegeId });
// };

// CollegeSuggestionSchema.query.paginate = function(page: number, perPage: number) {
//   page = parseInt(String(page), 10);
//   perPage = parseInt(String(perPage), 10);
//   return this.skip((page - 1) * perPage).limit(perPage);
// };
