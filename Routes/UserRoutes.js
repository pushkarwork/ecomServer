const express = require('express');
const { createUser, loginUser, logOut, forgetPassword, ResetPassword } = require('../Controllers/AuthControllers');
const router = express.Router();


router.route("/user/new").post(createUser)
router.route("/user/login").post(loginUser)
router.route("/user/logout").get(logOut)
router.route("/user/password/forgot").post(forgetPassword)
router.route("/password/reset/:token").put(ResetPassword)


module.exports = router;