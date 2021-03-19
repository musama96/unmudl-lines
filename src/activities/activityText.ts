import * as moment from 'moment';

export function generateActivityText(activity) {
  const user = activity.user ? activity.user.fullname : 'Unknown';
  const course = activity.course ? activity.course.title : null;
  const promo = activity.promo ? activity.promo.title : null;
  const otherUser = activity.otherUser ? activity.otherUser.fullname : 'Unknown';
  const learner = activity.learner ? activity.learner.fullname : 'Unknown';
  const enrollment = activity.enrollment;
  if (activity.type === 'user') {
    switch (activity.userActivity.name) {
      case 'uploadCourse' :
        return `${user} uploaded a course "${course}"`;
        break;
      case 'deleteCourse' :
        return `${user} deleted a course "${course}"`;
        break;
      case 'updateCourse' :
        return `${user} updated a course "${course}"`;
        break;
      case 'addUser' :
        return `${user} added ${otherUser} as a ${activity.userRole}`;
        break;
      case 'invitedUser' :
        return `${user} invited ${otherUser} as a ${activity.userRole}`;
        break;
      case 'userJoined' :
        return `${user} joined as a ${activity.userRole}`;
        break;
    }
  } else if (activity.type === 'transaction') {
    // console.log(activity.transactionActivity);
    switch (activity.transactionActivity.name) {
      case 'courseBought' :
        return `${enrollment ? enrollment.transactionId + ' - ' : ''}${learner} bought course "${course}"`;
        break;
      case 'courseBoughtWithPromo' :
        return `${enrollment ? enrollment.transactionId + ' - ' : ''} - ${learner} bought "${course}" using promo ${promo}`;
        break;
      case 'courseApplied' :
        return `${learner} applied for "${course}"`;
        break;
      case 'enrollmentApproved' :
        return `${user} approved ${learner}'s enrollment for "${course}"`;
        break;
      case 'enrollmentDeclined' :
        return `${user} declined ${learner}'s enrollment for "${course}"`;
        break;
      case 'enrollmentCanceled' :
        return `${learner} canceled his enrollment for "${course}"`;
        break;
      case 'enrollmentRefunded' :
          return `${user} refunded ${learner}'s enrollment for "${course}"`;
          break;
    }
  }
}
