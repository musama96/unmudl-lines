import {EnrollmentStatus} from '../../common/enums/enrollmentStatus.enum';
import {LearnerNotificationsIdentifiers} from '../learnersNotification.model';
import {NotificationsService} from '../notifications.service';

export function enrollmentStatusChanged(learner, enrollment, status, course) {
  let content = '';
  if (status === EnrollmentStatus.APPROVED) {
    content = `Your enrollment for course "${course.title}" has been approved.`;
  } else if (status === EnrollmentStatus.DECLINED) {
    content = `Your enrollment for course "${course.title}" has been declined.`;
  }
  const notification = {
    receiver: enrollment.learnerId,
    identifier: LearnerNotificationsIdentifiers.ENROLLMENT_STATUS,
    content,
    course: enrollment.courseId,
    enrollment: enrollment._id,
  };

}
