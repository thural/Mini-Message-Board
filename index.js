const express = require('express');
var logger = require('morgan');
var path = require('path');

// import routes
const index = require('./routes/index');

// Set up default mongoose connection
const mongoose = require('mongoose')
const dbURL = 'mongodb+srv://thural:aloeseed963@cluster0.rlei7la.mongodb.net/message_board?retryWrites=true&w=majority'
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
// Get the default connection
const db = mongoose.connection;
// Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// the Express server app
const app = express();

// View engine setup
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'pug');


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

// // repond to a post method from a form submission
// app.post('/login', authorize, (request, response) => {
//   const options = {
//     root: __dirname + "/private",
//     dotfiles: 'deny',
//     headers: {
//       'x-timestamp': Date.now(),
//       'x-sent': true
//     }
//   };
//   const fileName = "query.html";
//   response.sendFile(fileName, options, err => {
//     if (err) next(err)
//     else console.log('Sent:', fileName)
//   })
// })

// // Get data using a query
// app.get('/api/:collection/query?', (request, response) => {
//   const query = request.query;
//   const { collection } = request.params;
//   const documents = db[collection].filter(elem => {
//     return (Object.keys(query)).every(tag => query[tag] == elem[tag])
//   });
//   if (!documents.length) return response.status(200).json({ success: true, data: [] });
//   response.status(200).json(documents);
// })

app.all('*', (request, response) => {
  response.status(404).send('Error 404, Page not found');
})

app.listen(5000);