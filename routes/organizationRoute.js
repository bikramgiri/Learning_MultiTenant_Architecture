const { createOrganization, createPayment } = require("../controller/organization/organizationController")
const { isAuthenticated } = require("../middleware/isAuthenticated");

const router = require("express").Router(); 

router.route("/organization").post(isAuthenticated,createOrganization)
router.route("/payment").post(isAuthenticated,createPayment) 

module.exports = router; 