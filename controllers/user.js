// Import User model
const User = require("../models/user")
// Import validators
const { body, validationResult } = require("express-validator");
// Inport passport authenticator
const passport = require("passport");

// Handle user log-in on GET.
exports.login_get = (req, res) => res.render("login_form", {
  title: "Please log-in",
  user: { username: "", password: "" },
  errors: null,
});

// Handle user log-in on POST
exports.login_post = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/log-in"
});

// Handle user create on GET.
exports.create_get = (req, res) => res.render("signup_form", {
  title: "Create User",
  user: { username: "", password: "" },
  errors: null,
});

// Handle user create on POST.
exports.create_post = [
  // Validate and sanitize the form fields.
  body("username", "username required").trim().isLength({ min: 3 }).escape(),
  body("password", "password required").isLength({ min: 6 }).escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    // Create a user object with escaped and trimmed data from the form body.
    const user = new User({ username: req.body.username, password: req.body.password });
    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values.
      res.render("signup_form", {
        title: "Create User",
        user,
        errors: errors.array(),
      });
      return
    }
    else {
      // Data from the form is valid.
      // Check if user with same name already exists.
      User.findOne({ username: req.body.username })
        .exec((err, found_user) => {
          if (err) return next(err);
          if (found_user) {
            res.render("signup_form", {
              title: "Create User",
              user,
              errors: [{msg:"User with same name already exists"}],
            }) // render the formagain witht he error message
          } // redirect to message board.
          else {
            // all ok, attempt saving to db
            user.save((err) => {
              if (err) return next(err);
              // User saved. Redirect to message board page.
              res.redirect('/');
            });
          }
        });
    }
  },
];