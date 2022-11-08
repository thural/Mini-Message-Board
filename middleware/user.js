// Import User model
const User = require("../models/user");

// middleware to process validation and sanitization.
module.exports.validateUser = (req, res, next) => {
  // Extract the validation errors from a request.
  const errors = validationResult(req);
  // Create a user object with escaped and trimmed data from the form body.
  req.user = new User({ username: req.body.username, password: req.body.password });
  if (!errors.isEmpty()) {
    // There are errors. Render the form again with sanitized values.
    return res.render("signup_form", {
      title: "Create User",
      user: req.user,
      errors: errors.array()
    })
  }
  next()
};

// middleware to save user to db
module.exports.saveUser = async (req, res, next) => {
  // Check if user with same name already exists.
  try {
    const found_user = await User.findOne({ username: req.body.username });
    if (found_user) {
      return res.render("signup_form", {
        title: "Create User",
        user: req.user,
        errors: [{ msg: "User with same name already exists" }],
      }) // render the form again witht the error message
    }
  } catch (err) { return next(err) }
  // user does not exist, attempt saving to db using encryption
  bcrypt.hash(req.user.password, 10, (err, hashedPassword) => {
    // if err, do something
    if (err) return next(err);
    // otherwise, assign hashedPassword to userpassword
    req.user.password = hashedPassword;
    // save user with hashed passsword
    req.user.save((err) => {
      if (err) return next(err);
      // User saved. Redirect to message board page.
      res.redirect('/')
    })
  })
};