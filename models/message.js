const mongoose = require("mongoose");
const {DateTime} = require('luxon');

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  name: { type: String, required: true, maxLength: 16 },
  message: { type: String, required: true, maxLength: 100 },
  date: { type: Date, default: Date.now }
});

// Virtual property to get formmated date
MessageSchema.virtual("date_formatted").get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

// // Virtual for author's full name
// MessageSchema.virtual("name").get(function () {
//   let fullname = "";
//   if (this.first_name && this.family_name) {
//     fullname = `${this.family_name}, ${this.first_name}`;
//   }
//   if (!this.first_name || !this.family_name) {
//     fullname = "";
//   }
//   return fullname;
// });

// Create model
const Message = mongoose.model("Message", MessageSchema);
// Export model
module.exports = Message