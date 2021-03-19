"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enrollmentStatus_enum_1 = require("../../common/enums/enrollmentStatus.enum");
const learnersNotification_model_1 = require("../learnersNotification.model");
function enrollmentStatusChanged(learner, enrollment, status, course) {
    let content = '';
    if (status === enrollmentStatus_enum_1.EnrollmentStatus.APPROVED) {
        content = `Your enrollment for course "${course.title}" has been approved.`;
    }
    else if (status === enrollmentStatus_enum_1.EnrollmentStatus.DECLINED) {
        content = `Your enrollment for course "${course.title}" has been declined.`;
    }
    const notification = {
        receiver: enrollment.learnerId,
        identifier: learnersNotification_model_1.LearnerNotificationsIdentifiers.ENROLLMENT_STATUS,
        content,
        course: enrollment.courseId,
        enrollment: enrollment._id,
    };
}
exports.enrollmentStatusChanged = enrollmentStatusChanged;
//# sourceMappingURL=createLearnerNotifications.js.map