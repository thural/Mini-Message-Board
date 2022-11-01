const express = require("express");
const router = express.Router();
// Require controller module.
const message = require("../controllers/message");
const user = require("../controllers/user")

// requests for creating a Message.
router.route("/")
.get(message.list);

// requests for creating a User
router.route("/sign-up")
.get(user.create_get)
.post(user.create_post);

// requests for creating a Message.
router.route("/new")
.get(message.create_get)
.post(message.create_post);

module.exports = router