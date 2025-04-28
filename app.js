require('dotenv').config() // Load environment variables from a .env file into process.env
const express = require('express'); 
const app = express();


const userRoute = require('./routes/userRoute'); // Import user routes
const organizationRoute = require('./routes/organizationRoute'); // Import organization routes
app.use(require('cookie-parser')()); // Middleware to parse cookies from the request

// Require database
require('./model/index'); // Import the database connection and models

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded request bodies


app.get('/', (req, res) => {
    res.send('Hello World!'); // Respond with a simple message
});


app.use('', userRoute); // Use user routes for API requests
app.use('', organizationRoute); // Use organization routes for API requests


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

