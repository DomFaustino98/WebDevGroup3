// need to add server details

//Local host

const path = require('path');
const express = require('express');

const app = express();

//Static folder
app.use(express.static(path.join(__dirname, 'WEBDEVGROUP3')));

const PORT = process.env.PORT || 3000;

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.listen(3000, function () {
    console.log("Server is running on localhost3000");
});
//to run: npm run dev