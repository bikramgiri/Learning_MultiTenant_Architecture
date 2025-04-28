// *Useful in all project

const jwt = require("jsonwebtoken")
// const promisify = require("util").promisify 
// or
const {promisify} = require("util");
const { decodeToken } = require("../services/decodeToken");
const { users } = require("../model");

exports.isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token; // Get the token from the cookies
  
    // Check if the token is provided or not in the request
    if (!token) {
      return res.send("Please send token"); // If no token is found, return an error response
    }
    // Verify the token using the secret key and check if it is valid
    // Promisify handle call back function to avoid callback hell 
    const decryptedResult = await decodeToken(token, process.env.JWT_SECRETKEY) // Decode the token using the secret key
   //   console.log(decryptedResult)
    
    // check if that id(userID) users table ma exists xa ki nai
    const userExist = await users.findAll({
      where: {
        id: decryptedResult.id // Check if the user ID exists in the database
      }
    })
    if (userExist.length == 0) { // If the user ID is not found in the database
        // res.send("User with that token does not exist"); // Return an error response
    }else{
        req.user = userExist// Set the user ID in the request object for further use
        req.userId = userExist[0].id // Set the user ID in the request object for further use
        req.oraganizationNumber = userExist[0].currentOrganization // Set the organization number in the request object for further use
  
        next();
    }
  } catch (error) {
    console.error("Error in isAuthenticated middleware:", error); // Log the error for debugging
    res.status(500).send("Internal Server Error"); // Return a 500 status code for internal server error
  }
}
