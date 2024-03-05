const express = require("express");
const router = express.Router();
const { isAuthenticateduser,authorizedRoles } = require("../middleware/auth");
const {processPayment, sendStripeApiKey} = require("../controllers/paymentControllers");
router.route("/payment/process").post(isAuthenticateduser, processPayment);

router.route("/stripeapikey").get(isAuthenticateduser, sendStripeApiKey);

module.exports = router;