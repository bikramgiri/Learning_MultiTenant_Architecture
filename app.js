require('dotenv').config() // Load environment variables from a .env file into process.env
const express = require('express'); 
const app = express();


const userRoute = require('./routes/userRoute'); // Import user routes
const organizationRoute = require('./routes/organizationRoute'); // Import organization routes
const { Server } = require('socket.io');
const { users, sequelize } = require('./model/index');
const bcrypt = require('bcryptjs'); 
const { QueryTypes } = require('sequelize');
app.use(require('cookie-parser')()); // Middleware to parse cookies from the request

// Require database
require('./model/index'); // Import the database connection and models

app.set('view engine', 'ejs'); // Set EJS as the template engine

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded request bodies


app.get('/', (req, res) => {
    res.render("register")
})

// **Chat page 
app.get('/chat/:id', (req, res) => {
    sequelize.query(`CREATE TABLE IF NOT EXISTS chats (
        id INT AUTO_INCREMENT PRIMARY KEY NOT NULL, 
        senderId INT REFERENCES users(id),
        receiverId INT REFERENCES users(id),
        message VARCHAR(255) NOT NULL
    )`, { 
        type: QueryTypes.CREATE 
    }) // Create the chats table if it doesn't exist
    res.render("chat")
})

// **Users list page
app.get('/users', async(req, res) => {
    const usersList = await users.findAll() // Fetch all users from the database
    res.render("users", { usersList }) // Render the users page with the fetched users
})

app.use('', userRoute); // Use user routes for API requests
app.use('', organizationRoute); // Use organization routes for API requests

app.use(express.static('public/css')) 

const server = app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

const io = new Server(server)

// **Register Page socket.io
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


// **Chat Page 
io.on('connection', (socket) => {
    socket.on("message", async(msg) => {
        // console.log(msg)
        // **table ma data insert garne parne hunxa

        await sequelize.query(`INSERT INTO chats (senderId, receiverId, message) VALUES (?, ?, ?)`, {
            replacements: [msg.senderId, msg.receiverId, msg.message], // Use replacements to safely insert values into the query
            type: QueryTypes.INSERT // Specify the query type as INSERT
        }) // Insert the message into the chats table


        // **token decrypt hannu parnae hunxa ani userId lai grab garnu parnae hunxa

        io.emit("broadCastMessage", msg) // Emit the message to all connected clients
    })
})



