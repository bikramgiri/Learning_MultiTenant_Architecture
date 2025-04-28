const jwt = require("jsonwebtoken")
const {promisify} = require("util");

exports.decodeToken = async(token,secret) => {
      const decryptedResult = await promisify (jwt.verify)(token,secret) // Verify the token using the secret key and check if it is valid
      return decryptedResult
}