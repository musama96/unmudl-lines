export const RedisKeys = {
  learnerPortalCoursesList: addEnv('learnerPortalCoursesList'),
  learnerPortalLandingPageData: addEnv('learnerPortalLandingPageData'),
  collegesListForFilter: addEnv('collegesListForFilter'),
  courseCategoriesForFilter: addEnv('courseCategoriesForFilter'),
  sitemapColleges: addEnv('sitemapColleges'),
  sitemapCourses: addEnv('sitemapCourses'),
};

function addEnv(str) {
  return process.env.NODE_ENV + '-' + str;
}
