const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
  admin: {type:Boolean, default: false}
})

//Create model
const User = mongoose.model("User", UserSchema);
//Export model
module.exports = User;