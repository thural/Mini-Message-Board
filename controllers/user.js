const { validateUser, saveUser } = require("../middleware/user")
// require bad word filter module
const Filter = require('bad-words');
const customFilter = new Filter({ placeHolder: '*' });
// Import validators
const { body } = require("express-validator");
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
  failureRedirect: "/log-in" // TODO: try to include error message on login page
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
  body("username", "username required")
    .trim()
    .isLength({ min: 3, max: 12 })
    .withMessage('user name must be at least 3 and max 12 chars long')
    .escape(),

  body("username")
    .custom((value, { req }) => {
      if (customFilter.isProfane(value)) return false
      else return true;
    }).withMessage("User name can not contain bad words"),

  body("password", "password required")
    .isLength({ min: 6, max: 16 })
    .withMessage('password must be at least 6 and max 16 chars long')
    .escape(),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Password fields can not be empty.")
    .custom((value, { req }) => {
      if (value === req.body.password) return true
      else return false;
    }).withMessage("Passwords does not match."),

  validateUser,
  saveUser
];