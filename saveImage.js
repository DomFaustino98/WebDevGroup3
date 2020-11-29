//https://www.w3schools.com/nodejs/nodejs_uploadfiles.asp
//C:/Users/laurashelly/Documents/484Project/Images
var http = require('http');
var formidable = require('formidable');
var fs = require('fs');

http.createServer(function (req, res) {
  if (req.url == '/fileupload') {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.path;
      var newpath = '/public/images' + files.filetoupload.name; //new path: '/nodetest/public/images' || '/public/images'??? not entire sure lol
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        res.write('File uploaded and moved!');
        res.end();
      });
    });
  } 
  //i don't think we need the else
  else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="profilepic"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
  }
}).listen(8080);


// Below is code from https://medium.com/@nitinpatel_20236/image-upload-via-nodejs-server-3fe7d3faa642
// const express = require('express');
// const multer = require('multer');
// const upload = multer({dest: __dirname + '/public/images'});

// const app = express();
// const PORT = 3000;

// app.use(express.static('public'));

// app.post('/public', upload.single('photo'), (req, res) => {
//     if(req.file) {
//         res.json(req.file);
//     }
//     else throw 'error';
// });

// app.listen(PORT, () => {
//     console.log('Listening at ' + PORT );
// });



// Below Code is from https://stackoverflow.com/questions/15772394/how-to-upload-display-and-save-images-using-node-js-and-express

// const multer = require("multer");

// const handleError = (err, res) => {
//   res
//     .status(500)
//     .contentType("text/plain")
//     .end("Oops! Something went wrong!");
// };

// const upload = multer({
//     dest: "/Documents/Images"
//     //dest: "nodetest/public/images"
//   //dest: "/path/to/temporary/directory/to/store/uploaded/files"
//   // you might also want to set some limits: https://github.com/expressjs/multer#limits
// });


// app.post(
//   "/images",
//   upload.single("profilepic" /* name attribute of <file> element in your form */),
//   (req, res) => {
//     const tempPath = req.file.path;
//     const targetPath = path.join(__dirname, "./images/IMG_0231.JPG"); //replace the IMG part with the filename, maybe User.profilepic?

//     if (path.extname(req.file.originalname).toLowerCase() === ".png" || path.extname(req.file.originalname).toLowerCase() === ".jpg") {
//       fs.rename(tempPath, targetPath, err => {
//         if (err) return handleError(err, res);

//         res
//           .status(200)
//           .contentType("text/plain")
//           .end("File uploaded!");
//       });
//     } else {
//       fs.unlink(tempPath, err => {
//         if (err) return handleError(err, res);

//         res
//           .status(403)
//           .contentType("text/plain")
//           .end("Only .png and .jpg files are allowed!");
//       });
//     }
//   }
// );