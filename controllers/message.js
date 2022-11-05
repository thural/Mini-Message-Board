// require Message model
const Message = require("../models/message");
const dirty_words = require("../dirty_words");
// require bad word filter module
const Filter = require('bad-words');
const customFilter = new Filter({ placeHolder: '*'});
customFilter.addWords(...dirty_words);
// const async = require("async");

const { body, validationResult } = require("express-validator");

// Display list of all Messages.
exports.board = (req, res, next) => {
  Message.find()
    .sort([["date", "descending"]])
    .exec((err, messages) => {
      if (err) return next(err);
      if (req.user) { // if user logged in bring user's post to the top
        const postIndex = messages.findIndex(elem => elem.username === req.user.username);
        if (postIndex !== -1){
        const userPost = messages[postIndex];
        messages.splice(postIndex, 1);
        messages.unshift(userPost);
        }
      };
      //Successful, so render
      res.render("message_board", {
        title: "Message Board",
        messages,
        user: req.user
      });
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
  body("message")
  .custom((value, { req }) => {
    if (customFilter.isProfane(value)) return false;
    // regex match against the list of bad words
    const does_match = dirty_words.some(word => {
      const regex = new RegExp(`\\s${word}\\s|mother\\w+|sister\\w+`, 'i');
      return regex.test(value)
    });
    if (does_match) return false;
    return true;
  }).withMessage("Your message can not contain bad words"),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a message object with escaped and trimmed data.
    const message = new Message({ username: req.user.username, message: req.body.message });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("message_form", {
        title: "Create Message",
        data: message,
        errors: errors.array(),
      });
      return
    } else {
      // Data from form is valid.
      // Check if message with same name and message already exists.
      Message.findOne({ username: req.user.username, message: req.body.message })
        .exec((err, found_message) => {
          if (err) return next(err);
          if (found_message) res.redirect('/'); // redirect to message board.
          else {
            // all ok, attempt saving to db
            message.save((err) => {
              if (err) return next(err);
              // Message saved. Redirect to message board page.
              res.redirect('/');
            });
          }
        });
    }
  },
];

exports.delete_post = (req, res, next) => {
  if (req.params.id === "") return res.status(204).send() // avoid default on cancel
  Message.deleteOne({_id: req.params.id})
    .exec((err, message) => {
      if (err) return next(err);
      res.status(204).send() // avoid redirection after deleting

      //Successful, so render
      //console.log("user:", user)
      // res.render("message_board", {
      //   title: "Message Board",
      //   messages,
      //   user: req.user
      // });
    })
};