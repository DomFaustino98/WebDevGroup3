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



MongoClient.connect(uri, (err, database) => {
   // ... start the server 
})

const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect((err, database) => {
db = database.db("MovieDB")
app.listen(3000, function() {
  console.log('listening on 3000')
})
})


// GET REQUESTS - THIS ALLOWS THE SERVER TO ROUTE THE USER AND RENDER A PAGE BASED ON THE URL REQUEST //
// -------------------------------------------------------------------------------------------------- // 
app.get('/', (req, res) => {
  req.session.user = "";
  res.sendFile('index.html');
})

app.get('/userlist', (req, res) => {
  var cursor = db.collection('User').find().toArray(function(err, result){
   if (err) { return console.log(err) }
   res.render('userlist.ejs', {User: result})
 })
})

app.get('/profiler/myprofile', (req, res) => { // THIS CAN ONLY BE ACCESSED BY "VIEW PROFILE" IN THE HEADER, WILL ALWAYS BE USERS PROFILE
  var cursor = db.collection('User').findOne({id: req.session.user.id}, function(err, result){
    if(result){
      res.render('profileMMU.ejs', {User: result, session: req.session.user})
    }
  }) 
})

app.get('/profiler/editProfile', (req, res) => {
  if(req.session.user.id){
    var cursor = db.collection('User').findOne({id: req.session.user.id}, function(err, result){
    if (result){
      res.render('editProfile.ejs', {User: result})
    }
  })
}
})

// -------------------------------------------------------------------------------------------------- //
// POST REQUESTS - THIS ALLOWS THE SERVER TO RENDER/REROUTE THE USER BASED ON POSTED DATA FROM ANOTHER PAGE // 

app.post('/profiler/profilerProc.html', (req, res) => {
  var cursor = db.collection('User').findOne({id: req.body.id}, function(err, result){
    if(result){
      var newUser = {id: req.body.id};
      req.session.user = newUser;
      res.render('profileMMU.ejs', {User: result, session: newUser})
    }
    else {
      db.collection('User').save(req.body, (err, result) => {
        if (err) return console.log(err)
        var newUser = {id: req.body.id};
        req.session.user = newUser;
        res.render('signUp.ejs', {User: req.body})
      })
  }
})
})

app.post('/profiler/viewProfile.html', (req, res) => {
  var cursor = db.collection('User').findOne({id: req.body.id}, function(err, result){
      res.render('profileMMU.ejs', {User: result, session: req.session.user})
  })
})

app.post('/profiler/editProfile.html', (req, res) => {
  res.redirect('/')
})

app.post('/profile.html', (req, res) => {
res.sendFile(__dirname + '/index.ejs')
})


app.post('/profiler/uploadGenres', (req, res) => {
  if(req.session.user.id){
    var cursor = db.collection('User').findOne({id: req.session.user.id}, function(err, result){
      if(result){
        var userUpdate = {id: req.session.user.id};
        db.collection('User').update(userUpdate, {$set: {likedgenres: req.body.genres}, }, function(err, res){
          if (err) throw err;
          console.log("successfully updated"); 
        })
        res.render('profileMMU.ejs', {User: result, session: req.session.user})
      }
    })
  }
})

app.post('/profiler/EditProfileProc', (req, res) => {
  if(req.session.user.id){
    var cursor = db.collection('User').findOne({id: req.session.user.id}, function(err, result){
      if(result){
        var userUpdate = {id: req.session.user.id};
        db.collection('User').update(userUpdate, {$set: {firstname: req.body.fname, lastname: req.body.lname, bio: req.body.bio, name: req.body.name, favmovie: req.body.favMovie}, }, function(err, res){
          if (err) throw err;
          console.log("successfully updated");
        })
        console.log(result);
        res.render('profileMMU.ejs', {User: result, session: req.session.user})
      }
    })
  }
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

app.post("/upload", upload.single("profilepic" /* name attribute of <file> element in your form */), (req, res) => {
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