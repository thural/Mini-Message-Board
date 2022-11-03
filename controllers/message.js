// require Message model
const Message = require("../models/message");
// const async = require("async");

const { body, validationResult } = require("express-validator");


// Display list of all Messages.
exports.board = (req, res, next) => {
  Message.find()
    .sort([["date", "descending"]])
    .exec((err, messages) => {
      if (err) return next(err);
      //Successful, so render
      //console.log("user:", user)
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
  body("name", "name required").trim().isLength({ min: 3 }).escape(),
  body("message", "message required").isLength({ min: 2 }).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a message object with escaped and trimmed data.
    const message = new Message({ name: req.body.name, message: req.body.message });

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
      Message.findOne({ name: req.body.name, message: req.body.message })
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