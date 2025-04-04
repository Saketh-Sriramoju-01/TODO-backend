const express = require("express");
const router = express.Router();
const {
  getCourses,
  getCoursesDetails,
} = require("../controllers/coursesController");

router.route("/").get(getCourses);
router.route("/:id").get(getCoursesDetails);

module.exports = router;
