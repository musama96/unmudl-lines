import * as mongoose from 'mongoose';
import { DurationInterface } from '../common/interfaces/duration.interface';
import { DiscountCut, DiscountMetric, ApplyTo } from '../common/enums/createPromo.enum';

export const PromoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    discount: { type: Number, required: true },
    date: {
      start: { type: Date, required: true },
      end: { type: Date },
    },
    // expiryDate: { type: Date, required: true },
    applyTo: { type: String, enum: ['all', 'selected'], required: true },
    type: { type: String, enum: ['unmudl', 'both', 'gift'], required: true },
    status: { type: String, enum: ['active', 'suspended'], required: true },
    discountMetric: { type: String, enum: ['percentage', 'amount'], required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    addedByLearner: { type: mongoose.Schema.Types.ObjectId, ref: 'learners' },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'courses' }],
    learners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'learners' }],
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'colleges' },
  },
  {
    timestamps: true,
  },
);

PromoSchema.query.byKeyword = function(keyword) {
  return this.where({
    title: {
      $regex: keyword,
      $options: 'i',
    },
  });
};

PromoSchema.query.byCourse = function(courseId) {
  return this.where({
    courses: courseId,
  });
};

PromoSchema.query.paginate = function(page, perPage) {
  return this.skip((page - 1) * perPage).limit(perPage);
};

export interface Promo {
  _id?: string;
  title: string;
  // expiryDate: string;
  discount: number;
  date: DurationInterface;
  applyTo?: ApplyTo;
  discountMetric: DiscountMetric;
  type?: DiscountCut;
  status?: string;
  addedBy?: string;
  courses?: string[];
}
