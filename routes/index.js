const express = require("express");
const router = express.Router();
// Require controller module.
const message = require("../controllers/message");
const user = require("../controllers/user")

// request for default route
router.route("/")
.get(message.board);

// request for logging-in
router.route("/log-in")
.get(user.login_get)
.post(user.login_post);

// requests for creating a User
router.route("/sign-up")
.get(user.create_get)
.post(user.create_post);

// requests for creating a Message
router.route("/new")
.get(message.create_get)
.post(message.create_post);

// requests for editing a Message
router.route("/edit")
.get(message.edit_get)
.post(message.edit_post);

// request for logging-out
router.route("/log-out",)
.get((req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/");
  });
});

router.route('/delete/:id')
.post(message.delete_post);

router.route('/like/:id')
.post(message.like_post);

module.exports = router