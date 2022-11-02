require("dotenv").config();

const Course = require("../models/Course");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const rp = require("request-promise");

const checkConstraints = async (course) => {
  if (course.slug?.split(" ").length > 1) return false;
  if (course.slug && course.slug.length == 0)
    return false;

  if (course.fee && course.fee < 0) return false;

  if (course.tutor)
    try {
      const temp = await User.findOne({
        username: course.tutor,
        role: "tutor",
      });
      if (!temp) return false;
    } catch (err) { }

  if (course.rating)
    try {
      const temp = await User.findOne({ username: course.rating.username });
      if (!temp) return false;
    } catch (err) { }

  if (course.rating && (course.rating.star < 0 || course.rating.star > 5))
    return false;

  if (course.startingDate && course.endingDate) {
    const start = new Date(course.startingDate);
    const end = new Date(course.endingDate);
    if (start > end) return false;
  }

  return true;
};

class CoursesController {
  // [GET] /api/courses/search
  async search(req, res, next) {
    let { q, page, perPage } = req.query;

    try {
      let result = [];
      if (q) {
        const queryRegex = new RegExp(q, "i");
        const courseName = await Course.find({ courseName: queryRegex });
        const description = await Course.find({ description: queryRegex });
        const slug = await Course.find({ slug: queryRegex });

        result = courseName.concat(description, slug);
        result = result.filter(
          (thing, index, self) =>
            index === self.findIndex((t) => t.slug == thing.slug)
        );
      } else result = await Course.find({});

      if (!page) page = 1;
      if (!perPage) perPage = result.length;

      page = parseInt(page);
      perPage = parseInt(perPage);

      const totalPages = Math.ceil(result.length / perPage);
      if (page > totalPages)
        return res.status(200).json({
          message: "Search successfully",
          content: {
            currentPage: page,
            totalPages: totalPages,
            totalItems: result.length,
            perPage: perPage,
            items: [],
          },
        });
      else
        return res.status(200).json({
          message: "Search successfully",
          content: {
            currentPage: page,
            totalPages: totalPages,
            totalItems: result.length,
            perPage: perPage,
            items: result.slice(
              (page - 1) * perPage,
              (page - 1) * perPage + perPage
            ),
          },
        });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }

  // [GET] /api/courses/my-courses
  async getMyCourses(req, res, next) {
    const { username } = req.query;

    try {
      const result = await Course.find({ tutor: username });
      res.status(200).json({
        message: "Get your courses successfully",
        content: result,
      });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }

  // [POST] /api/courses/create
  async create(req, res, next) {
    const isValid = await checkConstraints(req.body);
    if (!isValid)
      return res
        .status(400)
        .json({ message: "Given course's information is invalid" });

    const { slug } = req.body;

    try {
      const existingCourse = await Course.findOne({ slug });
      if (existingCourse)
        return res.status(400).json({ message: "Course already exists" });

      const newCourse = await Course.create(req.body);
      res.status(200).json({
        message: "Create a new course successfully",
        content: newCourse._doc,
      });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }

  // [PUT] /api/courses/rate
  async rate(req, res, next) {
    const isValid = await checkConstraints(req.body);
    if (!isValid)
      return res
        .status(400)
        .json({ message: "Given course's information is invalid" });

    const { course, rating } = req.body;

    try {
      let existingCourse = await Course.findOne({ slug: course });
      if (!existingCourse)
        return res.status(400).json({ message: "Course does not exist" });

      const foundIndex = existingCourse.rating.findIndex(
        (item) => item.username == rating.username
      );
      if (foundIndex != -1)
        existingCourse.rating[foundIndex].star = rating.star;
      else existingCourse.rating.push(rating);

      const updatedCourse = await Course.findOneAndUpdate(
        { slug: course },
        { rating: existingCourse.rating },
        { new: true }
      );

      res.status(200).json({
        message: "Rate successfully",
        content: updatedCourse._doc,
      });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }

  // [PUT] /api/courses/update
  async update(req, res, next) {
    const isValid = await checkConstraints(req.body);
    if (!isValid)
      return res
        .status(400)
        .json({ message: "Given course's information is invalid" });

    const { slug } = req.body;

    try {
      const updatedCourse = await Course.findOneAndUpdate(
        { slug: slug },
        req.body,
        { new: true }
      );

      if (!updatedCourse)
        return res.status(400).json({ message: "Course dose not exist" });

      res.status(200).json({
        message: "Change course's info successfully",
        content: updatedCourse._doc,
      });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }

  // [POST] /api/courses/new-meeting
  async newMeeting(req, res, next) {
    const payload = {
      iss: process.env.API_ZOOM_KEY,
      exp: new Date().getTime() + 5000,
    };
    const token = jwt.sign(payload, process.env.API_ZOOM_SECRET_CODE);
    const { slug } = req.body;
    const courseDetail = await Course.findOne({ slug: req.body.slug });
    var email = "chuphongzoom123@gmail.com"; //Host Default
    var options = {
      method: "POST",
      uri: "https://api.zoom.us/v2/users/" + email + "/meetings",
      body: {
        topic: courseDetail.courseName,
        type: 1,
        settings: {
          host_video: "true",
          participant_video: "true",
          join_before_host: "true",
          use_pmi: "true", //Tao nhieu meeting
        },
      },
      auth: {
        bearer: token,
      },
      headers: {
        "User-Agent": "Nhom13",
        "content-type": "application/json",
      },
      json: true, //Parse the JSON string in the response
    };
    const response = await rp(options);
    const updatedCourse = await Course.findOneAndUpdate(
      { slug },
      { zoomLink: response.join_url, zoomHostLink: response.start_url },
      { new: true }
    );
    if (!updatedCourse)
      return res.status(400).json({ message: "Course does not exist" });

    res.status(200).json({
      message: "Create zoom link successfully",
      content: updatedCourse._doc,
    });
  }

  // [DELETE] /api/courses/delete
  async delete(req, res, next) {
    const { slug } = req.body;

    try {
      const temp = await Course.deleteOne({ slug });
      if (!temp.deletedCount)
        return res.status(400).json({ message: "Course does not exist" });

      res.status(200).json({ message: "Delete successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }

  // [GET] /api/courses/detail
  async getCourseDetail(req, res, next) {
    const { course } = req.query;

    try {
      const existingCourse = await Course.findOne({ slug: course });
      if (!existingCourse)
        return res.status(400).json({ message: "Course does not exist" });

      return res.status(200).json({
        message: "Get course detail successfully",
        content: existingCourse
      });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new CoursesController();
