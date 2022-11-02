const express = require('express');
const session = require("express-session");
const passport = require("passport");
const logger = require('morgan');
const path = require('path');
const User = require("./models/user")
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const dotenv = require('dotenv');

dotenv.config() // load env variables into process.env

// import routes
const index = require('./routes/index');

// Set up default mongoose connection
const mongoose = require('mongoose')
const mongoDB = process.env.MONGODB_URI || process.env.DEV_DB_URL;
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
      if (err) return done(err);
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      };
      // validate password against encryption password
      bcrypt.compare(password, user.password, (err, res) => {
        if (!res) return done(null, false, { message: "Incorrect password" })
        else return done(null, user);
      })
    });
  })
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
// use login session from passport middleware
app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// TODO: limit the user scope to a specific route
// // makes current user globally available
// app.use(function(req, res, next) {
//   res.locals.currentUser = req.user;
//   next();
// });

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
