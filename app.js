require('dotenv').config() // Load environment variables from a .env file into process.env
const express = require('express'); 
const app = express();


const userRoute = require('./routes/userRoute'); // Import user routes
const organizationRoute = require('./routes/organizationRoute'); // Import organization routes
const { Server } = require('socket.io');
const { users } = require('./model/index');
const bcrypt = require('bcryptjs') 
app.use(require('cookie-parser')()); // Middleware to parse cookies from the request

// Require database
require('./model/index'); // Import the database connection and models

app.set('view engine', 'ejs'); // Set EJS as the template engine

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded request bodies


app.get('/', (req, res) => {
    res.render("home")
});


app.use('', userRoute); // Use user routes for API requests
app.use('', organizationRoute); // Use organization routes for API requests

app.use(express.static('public/css')) 

const server = app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

const io = new Server(server)

io.on('connection', (socket) => {
    console.log("User connected!!")

    socket.on("register",async(data) => {
        const {username, email, password} = data
        await users.create({
            username : username,
            email : email,
            password : bcrypt.hashSync(password, 10) // Hash the password using bcrypt with a salt rounds of 10
          })
        socket.emit("response", {status: 200, message: "User registered successfully"})
    })
    socket.on("disconnect", () => {
    console.log("User disconnected!!")
    })
    
    
    
    // socket.on("request",(data) => {
    //     console.log(data)
    //     socket.emit("response", "Hello from server")
    // })
})
