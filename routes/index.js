const express = require("express");
const router = express.Router();
// Require controller module.
const message = require("../controllers/message");

// requests for creating a Message.
router.route("/")
.get(message.list)

// requests for creating a Message.
router.route("/new")
.get(message.create_get)
.post(message.create_post);

module.exports = router