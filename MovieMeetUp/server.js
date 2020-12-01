#!/usr/bin/env node

const express = require('express')
const bodyParser= require('body-parser') 
const path = require('path');
const app = express(); 
const fs = require("fs");
const http = require("http");
const MongoClient = require('mongodb').MongoClient  
const httpServer = http.createServer(app);
const multer = require("multer");

var uri = 'mongodb+srv://studentUser:iamstudent@cluster0.y9n1j.mongodb.net/movieDB?retryWrites=true&w=majority';
var session = require('express-session');
var cookieParser = require('cookie-parser');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static("public"));
app.use(cookieParser());
app.use(session({secret: "Your secret key"}));

app.set('view engine', 'ejs');
app.set('views','./views');



MongoClient.connect(uri, (err, database) => { // Connecting to our database using our defined variables above
   // ... start the server 
})

const client = new MongoClient(uri, { useNewUrlParser: true }); // Starting the server on localhost:3000 so it can process requests
client.connect((err, database) => {
db = database.db("MovieDB") // We only want to pull from our "MovieDB" database, so we define a db value when the server is booted
app.listen(3000, function() {
  console.log('listening on 3000')
})
})


// GET REQUESTS - THIS ALLOWS THE SERVER TO ROUTE THE USER AND RENDER A PAGE BASED ON THE URL REQUEST //
// -------------------------------------------------------------------------------------------------- // 
app.get('/', (req, res) => { // This is the initial request when navigating to the website. It will direct the user to the index.html file
  req.session.user = ""; // If the user chose to log out and return to this page, we will set the session back to nothing.
  res.sendFile('index.html');
})

app.get('/userlist', (req, res) => { // This will render the user list if the user requested to view the page
  var cursor = db.collection('User').find().toArray(function(err, result){ // First, we must create an array containing all data of current users in the database. This will allow our ejs page to access user information.
   if (err) { return console.log(err) }
   res.render('userlist.ejs', {User: result}) // We want to render the userlist with the array of user information we created. This allows us to display user information on the page.
 })
})

app.get('/profiler/myprofile', (req, res) => { // THIS CAN ONLY BE ACCESSED BY "VIEW PROFILE" IN THE HEADER, WILL ALWAYS BE USERS PROFILE
  var cursor = db.collection('User').findOne({id: req.session.user.id}, function(err, result){ // Grabs the session ID to find the user in the DB
    if(result){
      res.render('profileMMU.ejs', {User: result, session: req.session.user}) // Renders the page with the logged in users information
    }
  }) 
})

app.get('/profiler/editProfile', (req, res) => { // This allows the user to see all their data on the editProfile page and allows them to change it to their liking. Since users can only edit their own profile - it is safe to assume that the request is for the user logged in (The current session)
  if(req.session.user.id){
    var cursor = db.collection('User').findOne({id: req.session.user.id}, function(err, result){ // Find the user in the DB based on the session ID
    if (result){
      res.render('editProfile.ejs', {User: result}) // Render the edit profile page with all the user data
    }
  })
}
})

// -------------------------------------------------------------------------------------------------- //
// POST REQUESTS - THIS ALLOWS THE SERVER TO RENDER/REROUTE THE USER BASED ON POSTED DATA FROM ANOTHER PAGE // 

app.post('/profiler/profilerProc.html', (req, res) => { // This is an important post request - it sets the session and creates a user if the user does not already exist and then renders the appropriate page.
  var cursor = db.collection('User').findOne({id: req.body.id}, function(err, result){ // First - see if the user exists in the database
    if(result){ // If we found a user, do the following:
      var newUser = {id: req.body.id};
      req.session.user = newUser; // Set the session to this users ID
      res.render('profileMMU.ejs', {User: result, session: newUser}) // Load the profile viewer with the users information
    }
    else { // If we DID NOT find a user with the ID
      db.collection('User').save(req.body, (err, result) => { // Save the user to the DB 
        if (err) return console.log(err)
        var newUser = {id: req.body.id};
        req.session.user = newUser; // Set the session to the new user
        res.render('signUp.ejs', {User: req.body}) // Load the signup page with the users information so they can continue signing up
      })
  }
})
})

app.post('/selectGenres.html', (req, res) => { // This will be the first time the user selects genres after signing up...
  var cursor = db.collection('User').findOne({id: req.body.id}, function(err, result){ // Find the user in the DB based on the User ID
    if (result){
      var userUpdate = {id: req.body.id};
        db.collection('User').update(userUpdate, {$set: {firstname: req.body.fname, lastname: req.body.lname, name: req.body.name}, }, function(err, res){ // We update the basic information of the user from the signup page
          if (err) throw err;
          console.log("successfully updated"); // back-end console logging to make sure we updated a user...
        })
    }
  })
  res.redirect('genreSelection.html'); // Direct them to the genre selection HTML page
})

app.post('/profiler/viewProfile.html', (req, res) => { // This is a request to view another users profile (or their own profile)
  var cursor = db.collection('User').findOne({id: req.body.id}, function(err, result){ // An ID must be provided in this request so the server can locate the user in the database. If a use is found - the profile viewer is rendered with that users information
      res.render('profileMMU.ejs', {User: result, session: req.session.user}) // The session is also attached so we can see if the profile is the currently logged in user (If so, we allow them to edit their profile)
  })
})

app.post('/profiler/uploadGenres', (req, res) => { // This post request allows the server to save the favorite genres a user selected to the database
  if(req.session.user.id){ // IF THE SESSION EXISTS
    var cursor = db.collection('User').findOne({id: req.session.user.id}, function(err, result){ // We find the user (based off the session ID because only the logged in user can edit their own genres)
      if(result){ // If the user is found
        var userUpdate = {id: req.session.user.id};
        var genreArr = req.body.genres.split(',');
        db.collection('User').update(userUpdate, {$set: {likedgenres: genreArr}, }, function(err, res){ // We update the liked genres value within the Users collection for that specific user
          if (err) throw err;
          console.log("successfully updated"); // back-end console logging to make sure we updated a user...
        })
        res.render('profileMMU.ejs', {User: result, session: req.session.user}) // Take the user back to their profile by rendering the profile viewer with their data
      }
    })
  }
})

app.post('/profiler/EditProfileProc', (req, res) => { // This post allows the server to save edits to the users profile based off the session ID
  if(req.session.user.id){ // IF THE SESSION EXISTS
    var cursor = db.collection('User').findOne({id: req.session.user.id}, function(err, result){ // find the user in the DB 
      if(result){
        var userUpdate = {id: req.session.user.id}; 
        db.collection('User').update(userUpdate, {$set: {firstname: req.body.fname, lastname: req.body.lname, bio: req.body.bio, name: req.body.name, favmovie: req.body.favMovie}, }, function(err, res){ // Update all fields available
          if (err) throw err;
          console.log("successfully updated"); // back-end console logging to make sure we updated a user...
        })
        res.redirect('./myprofile') // render their profile with their information.
      }
    })
  }
})

app.post('/userlist-filtered', (req, res) => {
  var genreFilter = req.body.genreFilter
  var cursor = db.collection('User').find({likedgenres: genreFilter}).toArray(function(err, result){ // Find the user in the DB based on the session ID
    console.log(result);
    if (result){
    res.render('userlist.ejs', {User: result}) // We want to render the userlist with the array of user information we created. This allows us to display user information on the page.
  }
})
})

// -------------------------------------------------------------------------------------------------- //
// IMAGE UPLOAD CODE - THIS IS NECESSARY FOR ALLOWING USERS TO UPLOAD THEIR OWN PHOTOS FROM THE PROFILE EDITOR //

const upload = multer({ // Necessary to define the destination when uploading files
  dest: "/images"
});

const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

app.post("/upload", upload.single("profilepic"), (req, res) => {
    console.log(req.file);
    const tempPath = req.file.path;
    const name = req.file.originalname;
    const targetPath = path.join(__dirname, "./public/profiler/images/" + name);
      fs.rename(tempPath, targetPath, err => {
        if (err) return handleError(err, res);
        var userUpdate = {id: req.session.user.id};
        db.collection('User').update(userUpdate, {$set: {profilepic: "images/" + name}});
      });
  }
);
