const {registerUser, loginUser } = require("../controller/user/userController");
const catchError = require("../services/catchError");

const router = require("express").Router();

router.route("/register").post(catchError(registerUser)); 
router.route("/login").post(catchError(loginUser)); 

module.exports = router;