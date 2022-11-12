// require Message model
const Message = require("../models/message");
const User = require("../models/user");
const dirty_words = require("../dirty_words");
// require bad word filter module
const Filter = require('bad-words');
const customFilter = new Filter({ placeHolder: '*' });
customFilter.addWords(...dirty_words);

// custom input validation against bad word combos
const checkInput = (value, { req }) => {
  if (customFilter.isProfane(value)) return false;
  // regex match against the list of bad words
  const does_match = dirty_words.some(word => {
    const regex = new RegExp(`\\s${word}\\s|mother.+|sister.+`, 'i')
    return regex.test(value)
  })
  if (does_match) return false
  else return true
}

const { body, validationResult } = require("express-validator");
// require middleware
const { validateMessage, saveMessage } = require("../middleware/message");

// Display list of all Messages.
exports.board = (req, res, next) => {
  Message.find()
    .sort([["date", "descending"]])
    .exec((err, messages) => {
      if (err) return next(err);
      if (req.user) { // if user logged in bring user's post to the top
        const postIndex = messages.findIndex(elem => elem.username === req.user.username);
        if (postIndex !== -1) {
          const userPost = messages[postIndex];
          messages.splice(postIndex, 1);
          messages.unshift(userPost);
        }
      }
      //Successful, so render
      res.render("message_board", {
        title: "Message Board",
        messages,
        user: req.user
      })
    })
};

// Display message create form on GET.
exports.create_get = (req, res, next) => {
  res.render("message_form", {
    title: "Add Message",
    data: { name: "", message: "" }
  })
};

// Handle message create on POST.
exports.create_post = [
  // Validate and sanitize the name field.
  body("message", "at least 2 characters required").isLength({ min: 2 }),
  body("message", "max 64 characters allowed").isLength({ max: 64 }),
  body("message").custom(checkInput).withMessage("Your message can not contain bad words"),

  validateMessage,
  saveMessage
];

// Display message edit form on POST.
exports.edit_get = (req, res, next) => {
  Message.findOne({ "username": req.user.username }).exec((err, message) => {
    res.render("message_form", {
      title: "Edit Message",
      data: { name: req.user.username, message: message.message }
    })
  })
};

// Handle message edit on POST.
exports.edit_post = [
  // Validate and sanitize the name field.
  body("message", "at least 2 characters required").isLength({ min: 2 }),
  body("message", "max 64 characters allowed").isLength({ max: 64 }),
  body("message").custom(checkInput).withMessage("Your message can not contain bad words"),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req)
    // Find the user message object and edit message property.
    try {
      const message = await Message.findOne({ "username": req.user.username })
      message.message = req.body.message;
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        return res.render("message_form", {
          title: "Edit Message",
          method: 'POST',
          data: message,
          errors: errors.array(),
        })
      }
      // Data from form is valid, attempt saving to db
      message.save((err) => {
        if (err) return next(err)
        // Message saved. Redirect to message board page.
        res.redirect('/')
      })
    } catch (err) { return next(err) }
  }
];

exports.delete_post = (req, res, next) => {
  if (req.params.id === "") return res.status(204).send() // avoid default on cancel
  Message.deleteOne({ _id: req.params.id })
    .exec((err, message) => {
      if (err) return next(err)
      res.status(204).send() // avoid redirection after deleting

      //Successful, so render
      //console.log("user:", user)
      // res.render("message_board", {
      //   title: "Message Board",
      //   messages,
      //   user: req.user
      // });
    })
}

exports.like_post = async (req, res, next) => {
  if (req.params.id === "") return res.status(204).send() // avoid default response
    try {
      await Message.updateOne({ _id: req.params.id }, {"$push": {likes:req.user._id}})
      await User.updateOne({_id:req.user._id}, {"$push":{likes:req.params.id}})
      res.status(204).send() // avoid redirection and re-rendering
    } catch(err) {return next(err)}
}