const express = require('express')
const bodyParser= require('body-parser') 
const path = require('path');
const app = express(); 
var session = require('express-session');
var cookieParser = require('cookie-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static("public"));
app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!"}));

const MongoClient = require('mongodb').MongoClient  
var uri = 'mongodb+srv://studentUser:iamstudent@cluster0.y9n1j.mongodb.net/movieDB?retryWrites=true&w=majority';
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

app.get('/index', (req, res) => {
   var cursor = db.collection('User').find().toArray(function(err, result){
    if (err) { return console.log(err) }
    console.log('haanbhai', result)
    res.render('index.ejs', {User: result})
  })
})

app.post('/profiler/profilerProc.html', (req, res) => {
  var cursor = db.collection('User').findOne({id: req.body.id}, function(err, result){
    if(result){
      res.render('profileMMU.ejs', {User: result})
    }
    else {
      db.collection('User').save(req.body, (err, result) => {
        if (err) return console.log(err)
        res.redirect('/profiler/profileMMU.ejs')
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
