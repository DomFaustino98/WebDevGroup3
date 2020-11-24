// need to add server details

//Local host
const path = require('path');
const express = require('express');

const app = express();

//Static folder
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log('Server running on port ${PORT}'));

//to run: npm run dev