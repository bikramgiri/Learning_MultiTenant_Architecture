const { users } = require('../../model/index')
const bcrypt = require('bcryptjs') 
const jwt = require('jsonwebtoken') 


exports.registerUser = async(req,res)=>{
  const {username,email,password} = req.body
  
  if(!username || !email || !password){ // Check if all required fields are provided
    return res.status(400).send("All fields are required")
  }

  const existingUser = await users.findAll({
    where : {
      email : email // Check if the email already exists in the database
    }
  })
  
  if(existingUser.length > 0){ // If the email already exists, return an error response
    return res.send("Email already exists")
  }
  
  await users.create({
    username : username,
    email : email,
    password : bcrypt.hashSync(password, 10) // Hash the password using bcrypt with a salt rounds of 10
  })
  res.send("User registered successfully")
}


// **Login page
// exports.renderLoginForm = (req,res)=>{
//   const error = req.flash("error") 
//   res.render("login", {error: error}) // Render the login page with any error messages from the flash session
// }

exports.loginUser = async(req,res)=>{
  const {email,password} = req.body

// server side validation
  if(!email || !password){ // Check if all required fields are provided
    return res.status(400).send("All fields are required")
  }

  const userExists = await users.findAll({
    where : {
      email : email
    }
  })
  
  if(userExists.length == 0){ // Check if the user exists in the database
    return res.send("User not found")
  }else{
    const userPassword = userExists[0].password // Get the hashed password from the database
    const isValid = bcrypt.compareSync(password,userPassword) // Compare the provided password with the hashed password in the database
  if(isValid){
    // Generate a JWT token for the user
    const token = jwt.sign({ id: userExists[0].id }, process.env.JWT_SECRETKEY, { expiresIn: '5d' }) // Create a JWT token with the user's ID and a secret key
    // res.cookie("token", token)
    // Or
    res.cookie("token", token, { // Set the token as a cookie in the response
      httpOnly: true, // Make the cookie HTTP-only to prevent client-side access
      secure: true, // Set the secure flag to true to ensure the cookie is sent over HTTPS
      // secure: process.env.NODE_ENV === 'production', // Set the secure flag for production environment
      maxAge: 5*24 * 60 * 60 * 1000 // Set the cookie expiration time to 5 days
    })
    return res.send("Login successful") 
  }else{
    return res.send("Invalid password") // If the password is invalid, return an error response
  }
  }
}

