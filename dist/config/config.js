"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const Pusher = require("pusher");
const twilio = require("twilio");
dotenv.config();
exports.PORT = process.env.PORT;
exports.HOSTNAME = process.env.HOSTNAME;
exports.MONGOURI = process.env.MONGOURI;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.AVALARA_USERNAME = process.env.AVALARA_USERNAME;
exports.AVALARA_PASSWORD = process.env.AVALARA_PASSWORD;
exports.SCORECARD_API_KEY = process.env.SCORECARD_API_KEY;
exports.MAILER_HOST = process.env.MAILER_HOST;
exports.MAILER_PORT = process.env.MAILER_PORT;
exports.MAILER_AUTH_USER = process.env.MAILER_AUTH_USER;
exports.MAILER_AUTH_PASS = process.env.MAILER_AUTH_PASS;
exports.MAILER_SECURE = process.env.MAILER_SECURE !== 'true' ? false : true;
exports.MAILER_MODE = process.env.MAILER_MODE;
exports.LEARNER_PORTAL_URL = process.env.LEARNER_PORTAL_URL;
exports.COLLEGE_FORGOT_PASSWORD_URL = process.env.COLLEGE_FORGOT_PASSWORD_URL;
exports.ADMIN_FORGOT_PASSWORD_URL = process.env.ADMIN_FORGOT_PASSWORD_URL;
exports.LEARNER_FORGOT_PASSWORD_URL = process.env.LEARNER_FORGOT_PASSWORD_URL;
exports.EMPLOYER_FORGOT_PASSWORD_URL = process.env.EMPLOYER_FORGOT_PASSWORD_URL;
exports.COLLEGE_INVITATION_URL = process.env.COLLEGE_INVITATION_URL;
exports.EMPLOYER_INVITATION_URL = process.env.EMPLOYER_INVITATION_URL;
exports.USER_INVITATION_URL = process.env.USER_INVITATION_URL;
exports.COLLEGE_USER_INVITATION_URL = process.env.COLLEGE_USER_INVITATION_URL;
exports.EMPLOYER_ADMIN_INVITATION_URL = process.env.EMPLOYER_ADMIN_INVITATION_URL;
exports.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
exports.USERS_IMG_PATH = process.env.USERS_IMG_PATH;
exports.LEARNERS_IMG_PATH = process.env.LEARNERS_IMG_PATH;
exports.COLLEGES_IMG_PATH = process.env.COLLEGES_IMG_PATH;
exports.EMPLOYER_COMPANIES_BANNER_PATH = process.env.EMPLOYER_COMPANIES_BANNER_PATH;
exports.EMPLOYER_COMPANIES_IMG_PATH = process.env.EMPLOYER_COMPANIES_IMG_PATH;
exports.EMPLOYER_ADMINS_IMG_PATH = process.env.EMPLOYER_ADMINS_IMG_PATH;
exports.COLLEGE_CONTACT_PROPOSALS_FILES_PATH = process.env.COLLEGE_CONTACT_PROPOSALS_FILES_PATH;
exports.COLLEGE_CONTACT_PROPOSALS_RESPONSE_FILES_PATH = process.env.COLLEGE_CONTACT_PROPOSALS_RESPONSE_FILES_PATH;
exports.CHAT_FILES_PATH = process.env.CHAT_FILES_PATH;
exports.COURSES_IMG_PATH = process.env.COURSES_IMG_PATH;
exports.COURSES_ATTACHMENTS_PATH = process.env.COURSES_ATTACHMENTS_PATH;
exports.EMPLOYERS_LOGOS_PATH = process.env.EMPLOYERS_LOGOS_PATH;
exports.BLOGS_IMG_PATH = process.env.BLOGS_IMG_PATH;
exports.CAPTURE_DELAY = process.env.CAPTURE_DELAY;
exports.TRANSFER_DELAY = process.env.TRANSFER_DELAY;
exports.BLOG_APPLICATION_MAIL = process.env.BLOG_APPLICATION_MAIL;
exports.NUMBER_STRING_FIELDS = [
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
exports.LOCATION_SEARCH_RADIUS = process.env.LOCATION_SEARCH_RADIUS;
exports.PHONE_NUMBER_REGEX = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
exports.PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[A-Za-z]).{6,}$/;
exports.pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    encrypted: true,
});
exports.twilioClient = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
exports.BLOG_THUMBNAIL_SIZE = { width: 854, height: 480 };
exports.COURSE_THUMBNAIL_SIZE = { width: 400, height: 400 };
exports.PROFILE_PHOTO_THUMBNAIL_SIZE = { width: 200, height: 200 };
exports.COLLEGE_LOGO_THUMBNAIL_SIZE = { width: 200, height: 200 };
exports.PRAGYA_KEY = process.env.PRAGYA_KEY;
exports.PRAGYA_SECRET = process.env.PRAGYA_SECRET;
exports.PRAGYA_URL_GET_TOKEN = process.env.PRAGYA_URL_GET_TOKEN;
exports.PRAGYA_URL_CREATE_USER = process.env.PRAGYA_URL_CREATE_USER;
exports.PRAGYA_URL_CREATE_ENROLLMENT = process.env.PRAGYA_URL_CREATE_ENROLLMENT;
exports.PRAGYA_URL_GET_COURSE_LAUNCH_URL = process.env.PRAGYA_URL_GET_COURSE_LAUNCH_URL;
//# sourceMappingURL=config.js.map