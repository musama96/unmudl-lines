import * as mongoose from 'mongoose';

export const LandingPageSchema = new mongoose.Schema(
  {
    coverPhoto: { type: String },
    pictureCredits: { type: String },
    altTag: { type: String },
    title: { type: String },
    tagLine: { type: String },
    tagLineHyperlink: { type: String },
    partners: [{ type: mongoose.Types.ObjectId, ref: 'colleges' }],
    featured: [{ type: mongoose.Types.ObjectId, ref: 'courses' }],
    featuredTitle: { type: String },
    featuredDescription: { type: String },
    hideFeatured: { type: Boolean, default: false },
    highlyRated: [{ type: mongoose.Types.ObjectId, ref: 'courses' }],
    highlyRatedTitle: { type: String },
    highlyRatedDescription: { type: String },
    hideHighlyRated: { type: Boolean, default: false },
    credentialCourses: [{ type: mongoose.Types.ObjectId, ref: 'courses' }],
    credentialCoursesTitle: { type: String },
    credentialCoursesDescription: { type: String },
    hideCredentialCourses: { type: Boolean, default: false },
    blogs: [{ type: mongoose.Types.ObjectId, ref: 'blogs' }],
    blogsTitle: { type: String },
    blogsDescription: { type: String },
    hyperlink: { type: String },
    about: { type: String },
    why: { type: String },
    privacyPolicy: { type: String },
    termsOfService: { type: String },
    accessibility: { type: String },
    previewContent: { type: String },
    titleColor: { type: String },
    subtitleColor: { type: String },
  },
  {
    timestamps: true,
  },
);

export interface LandingPage {
  altTag?: string;
  title: string;
  tagLine: string;
}
