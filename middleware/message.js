// require Message model
const Message = require("../models/message");
// require express validator
const { validationResult } = require("express-validator");


module.exports.validateMessage = (req, res, next) => {
  // Extract the validation errors from a request.
  const errors = validationResult(req);
  // Create a message object with escaped and trimmed data.
  req.message = new Message({ username: req.user.username, message: req.body.message })
  if (!errors.isEmpty()) {
    // There are errors. Render the form again with sanitized values/error messages.
    return res.render("message_form", {
      title: "Create Message",
      method: 'POST',
      data: req.message,
      errors: errors.array(),
    })
  } next()
}

module.exports.saveMessage = async (req, res, next) => {
  // Check if message with same name and message already exists.
  try {
    const found_message = await Message.findOne({ username: req.user.username, message: req.body.message })
    // if already exists redirect to message board.
    if (found_message) res.redirect('/')
    else {
      // all ok, attempt saving to db
      req.message.save((err) => {
        if (err) return next(err)
        // Message saved. Redirect to message board page.
        res.redirect('/')
      })
    }
  } catch (err) { return next(err) }
}