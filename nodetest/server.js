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


app.get('/', (req, res) => {
  res.sendFile('index.html');
})

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

app.post('/profiler/editProfile.html', (req, res) => {
  res.redirect('/')
})

app.post('/profile.html', (req, res) => {
res.sendFile(__dirname + '/index.ejs')
})

app.get('/profileMMU', checkSignIn, function(req, res){
  console.log("here")
  res.render('profileMMU.ejs', {User: result})
});

app.post('/pageNameHere.html', (req, res) => {
  console.log(req.body);
})

const upload = multer({
  dest: "/images"
  // you might also want to set some limits: https://github.com/expressjs/multer#limits
});

app.post('/profiler/EditProfileProc', (req, res) => {
  if(req.session.user.id){
    var cursor = db.collection('User').findOne({id: req.session.user.id}, function(err, result){
      if(result){
        var userUpdate = {id: req.session.user.id};
        db.collection('User').update(userUpdate, {$set: {firstname: req.body.fname, lastname: req.body.lname, bio: req.body.bio, name: req.body.name, favmovie: req.body.favMovie, profilepic: req.body.profilepic}, }, function(err, res){
          if (err) throw err;
          console.log("successfully updated"); 
        })
        res.render('profileMMU.ejs', {User: result})
      }
    })
  }
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

function checkSignIn(req, res){
  if(req.session.user){
     next();     //If session exists, proceed to page
  } else {
     var err = new Error("Not logged in!");
     console.log(req.session.user);
     next(err);  //Error, trying to access unauthorized page!
  }
}

// IMAGE UPLOAD CODE
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
        db.collection('User').update(userUpdate, {$set: {profilepic: name}});
      });
  }
);