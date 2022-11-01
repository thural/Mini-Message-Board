const express = require('express');
const session = require("express-session");
const passport = require("passport");
const logger = require('morgan');
const path = require('path');
const User = require("./models/user")
const LocalStrategy = require("passport-local").Strategy;

// import routes
const index = require('./routes/index');

// Set up default mongoose connection
const mongoose = require('mongoose')
const dev_db_url = "mongodb+srv://thural:<password>@cluster0.rlei7la.mongodb.net/message_board?retryWrites=true&w=majority";
const mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
// Get the default connection
const db = mongoose.connection;
// Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// the Express server app
const app = express();

// View engine setup
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'pug');

//Passport LocalStrategy
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      if (user.password !== password) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    });
  })
);
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
// use login session from passport middleware
app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// static file server
app.use(express.static(path.join(__dirname, 'public')));
// parse form data
app.use(express.urlencoded({extended:false}))
// parse json
app.use(express.json())
// use a middleware on all routes
app.use(logger('dev'));

// use index router
app.use('/', index)

app.all('*', (request, response) => {
  response.status(404).send('Error 404, Page not found');
})

app.listen(5000);
