import * as mongoose from 'mongoose';

export const ActivityTypes = {
  User: 'user',
  Transaction: 'transaction',
};

export const ActivitySchema = new mongoose.Schema(
  {
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    course: {type: mongoose.Schema.Types.ObjectId, ref: 'courses'},
    learner: {type: mongoose.Schema.Types.ObjectId, ref: 'learners'},
    promo: {type: mongoose.Schema.Types.ObjectId, ref: 'promos'},
    enrollment: {type: mongoose.Schema.Types.ObjectId, ref: 'enrollments'},
    otherUser: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    type: {type: String, enum: ['user', 'transaction'], required: true},
    userRole: {type: String, enum: ['instructor', 'moderator', 'manager', 'admin', 'superadmin']},
    userActivity: {type: mongoose.Schema.Types.ObjectId, ref: 'useractivitycategories'},
    transactionActivity: {type: mongoose.Schema.Types.ObjectId, ref: 'transactionactivitycategories'},
  },
  {
    timestamps: true,
  },
);

ActivitySchema.query.paginate = function(page, perPage) {
  return this.skip((page - 1) * perPage).limit(perPage);
};
