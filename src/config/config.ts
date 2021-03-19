import * as dotenv from 'dotenv';
import * as Pusher from 'pusher';
import * as twilio from 'twilio';

dotenv.config();

export const PORT = process.env.PORT;
export const HOSTNAME = process.env.HOSTNAME;
export const MONGOURI = process.env.MONGOURI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const AVALARA_USERNAME = process.env.AVALARA_USERNAME;
export const AVALARA_PASSWORD = process.env.AVALARA_PASSWORD;
export const SCORECARD_API_KEY = process.env.SCORECARD_API_KEY;
export const MAILER_HOST = process.env.MAILER_HOST;
export const MAILER_PORT = process.env.MAILER_PORT;
export const MAILER_AUTH_USER = process.env.MAILER_AUTH_USER;
export const MAILER_AUTH_PASS = process.env.MAILER_AUTH_PASS;
export const MAILER_SECURE = process.env.MAILER_SECURE !== 'true' ? false : true;
export const MAILER_MODE = process.env.MAILER_MODE;
export const LEARNER_PORTAL_URL = process.env.LEARNER_PORTAL_URL;
export const COLLEGE_FORGOT_PASSWORD_URL = process.env.COLLEGE_FORGOT_PASSWORD_URL;
export const ADMIN_FORGOT_PASSWORD_URL = process.env.ADMIN_FORGOT_PASSWORD_URL;
export const LEARNER_FORGOT_PASSWORD_URL = process.env.LEARNER_FORGOT_PASSWORD_URL;
export const EMPLOYER_FORGOT_PASSWORD_URL = process.env.EMPLOYER_FORGOT_PASSWORD_URL;
export const COLLEGE_INVITATION_URL = process.env.COLLEGE_INVITATION_URL;
export const EMPLOYER_INVITATION_URL = process.env.EMPLOYER_INVITATION_URL;
export const USER_INVITATION_URL = process.env.USER_INVITATION_URL;
export const COLLEGE_USER_INVITATION_URL = process.env.COLLEGE_USER_INVITATION_URL;
export const EMPLOYER_ADMIN_INVITATION_URL = process.env.EMPLOYER_ADMIN_INVITATION_URL;
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const USERS_IMG_PATH = process.env.USERS_IMG_PATH;
export const LEARNERS_IMG_PATH = process.env.LEARNERS_IMG_PATH;
export const COLLEGES_IMG_PATH = process.env.COLLEGES_IMG_PATH;
export const EMPLOYER_COMPANIES_BANNER_PATH = process.env.EMPLOYER_COMPANIES_BANNER_PATH;
export const EMPLOYER_COMPANIES_IMG_PATH = process.env.EMPLOYER_COMPANIES_IMG_PATH;
export const EMPLOYER_ADMINS_IMG_PATH = process.env.EMPLOYER_ADMINS_IMG_PATH;
export const COLLEGE_CONTACT_PROPOSALS_FILES_PATH = process.env.COLLEGE_CONTACT_PROPOSALS_FILES_PATH;
export const COLLEGE_CONTACT_PROPOSALS_RESPONSE_FILES_PATH = process.env.COLLEGE_CONTACT_PROPOSALS_RESPONSE_FILES_PATH;
export const CHAT_FILES_PATH = process.env.CHAT_FILES_PATH;
export const COURSES_IMG_PATH = process.env.COURSES_IMG_PATH;
export const COURSES_ATTACHMENTS_PATH = process.env.COURSES_ATTACHMENTS_PATH;
export const EMPLOYERS_LOGOS_PATH = process.env.EMPLOYERS_LOGOS_PATH;
export const BLOGS_IMG_PATH = process.env.BLOGS_IMG_PATH;
export const CAPTURE_DELAY = process.env.CAPTURE_DELAY;
export const TRANSFER_DELAY = process.env.TRANSFER_DELAY;
export const BLOG_APPLICATION_MAIL = process.env.BLOG_APPLICATION_MAIL;
export const NUMBER_STRING_FIELDS = [
  'zip',
  'keyword',
  'order',
  'sortOrder',
  'phoneNumber',
  'message',
  'collegeName',
  'contactPerson',
  'studentId',
];
export const LOCATION_SEARCH_RADIUS = process.env.LOCATION_SEARCH_RADIUS;
export const PHONE_NUMBER_REGEX = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[A-Za-z]).{6,}$/;
export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  encrypted: true,
});
// @ts-ignore
export const twilioClient = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
export const BLOG_THUMBNAIL_SIZE = { width: 854, height: 480 };
export const COURSE_THUMBNAIL_SIZE = { width: 400, height: 400 };
export const PROFILE_PHOTO_THUMBNAIL_SIZE = { width: 200, height: 200 };
export const COLLEGE_LOGO_THUMBNAIL_SIZE = { width: 200, height: 200 };

export const PRAGYA_KEY = process.env.PRAGYA_KEY;
export const PRAGYA_SECRET = process.env.PRAGYA_SECRET;
export const PRAGYA_URL_GET_TOKEN = process.env.PRAGYA_URL_GET_TOKEN;
export const PRAGYA_URL_CREATE_USER = process.env.PRAGYA_URL_CREATE_USER;
export const PRAGYA_URL_CREATE_ENROLLMENT = process.env.PRAGYA_URL_CREATE_ENROLLMENT;
export const PRAGYA_URL_GET_COURSE_LAUNCH_URL = process.env.PRAGYA_URL_GET_COURSE_LAUNCH_URL;
