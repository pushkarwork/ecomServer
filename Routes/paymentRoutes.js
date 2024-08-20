const express = require('express');
const { isAuthenticated_User, Authorize_Roles } = require('../Middlewares/AuthMiddleware');
const { stripeCheckoutSession, stripeWebHook } = require('../Controllers/paymentController');

const router = express.Router();

router.route("/payment/checkout_session").post(isAuthenticated_User, stripeCheckoutSession)

//to run this below webhook ,in cmd run this => stripe listen --events checkout.session.completed --forward-to http://localhost:4500/api/v1/payment/webhook
router.route("/payment/webhook").post(stripeWebHook)




module.exports = router;

// whsec_1f2e2659bc0a410dbff90cf17004ff77ad35873d4f839d611e42c7d668f4cb61