import { User } from '../../users/user.model';
import responseMessages from '../../config/responseMessages';

export function isAuthorized(userToUpdate: User, requestingUser: User) {
  if (userToUpdate.role === 'superadmin') {
    return { isAuthorized: false, msg: responseMessages.access.superadmin };
  } else if (requestingUser.collegeId && userToUpdate.collegeId.toString() !== requestingUser.collegeId.toString()) {
    return { isAuthorized: false, msg: responseMessages.access.college };
  } else if (requestingUser.employerId && userToUpdate.employerId.toString() !== requestingUser.employerId.toString()) {
    return { isAuthorized: false, msg: responseMessages.access.employer };
  } else if (
    (userToUpdate.role === 'admin' && (requestingUser.role === 'manager' || requestingUser.role === 'moderator')) ||
    (userToUpdate.role === 'manager' && requestingUser.role === 'moderator')
  ) {
    return { isAuthorized: false, msg: responseMessages.access.higherRole };
  } else {
    return { isAuthorized: true };
  }
}
