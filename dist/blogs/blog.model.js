"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.BlogSchema = new mongoose.Schema({
    headerImage: { type: String },
    headerImageThumbnail: { type: String },
    altText: { type: String },
    contributors: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'users' }],
    employerContributors: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'employer-admins' }],
    author: { type: mongoose.SchemaTypes.ObjectId, ref: 'users' },
    employerAuthor: { type: mongoose.SchemaTypes.ObjectId, ref: 'employer-admins' },
    permalink: { type: String },
    content: { type: String, required: true },
    featured: { type: Number, default: null },
    title: { type: String, required: true },
    tagline: { type: String, required: true },
    excerpt: { type: String, required: true },
    collegeId: { type: mongoose.SchemaTypes.ObjectId, ref: 'colleges' },
    employerId: { type: mongoose.SchemaTypes.ObjectId, ref: 'employer-companies' },
    tags: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'blog-tags' }],
    status: { type: String, enum: ['pending', 'draft', 'published', 'unpublished', 'denied'] },
    type: { type: String, enum: ['unmudl', 'college', 'employer'] },
    views: { type: Number, default: 0 },
    numId: { type: Number, unique: true },
    publishDate: { type: Date },
}, {
    timestamps: true,
});
exports.TrashedBlogSchema = new mongoose.Schema({
    headerImage: { type: String },
    altText: { type: String },
    title: { type: String, required: true },
    tagline: { type: String, required: true },
    excerpt: { type: String, required: true },
    contributors: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'users' }],
    employerContributors: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'employer-admins' }],
    author: { type: mongoose.SchemaTypes.ObjectId, ref: 'users' },
    employerAuthor: { type: mongoose.SchemaTypes.ObjectId, ref: 'employer-admins' },
    blogId: { type: mongoose.SchemaTypes.ObjectId, ref: 'blogs' },
    permalink: { type: String },
    content: { type: String, required: true },
    tags: [{ type: String }],
    collegeId: { type: mongoose.SchemaTypes.ObjectId, ref: 'colleges' },
    employerId: { type: mongoose.SchemaTypes.ObjectId, ref: 'employer-companies' },
    status: { type: String },
}, {
    timestamps: true,
});
exports.BlogSchema.query.paginate = function (page, perPage) {
    return this.skip((page - 1) * perPage).limit(perPage);
};
//# sourceMappingURL=blog.model.js.map