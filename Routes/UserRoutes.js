const express = require('express');
const { createUser, loginUser } = require('../Controllers/AuthControllers');
const router = express.Router();


router.route("/user/new").post(createUser)
router.route("/user/login").post(loginUser)


module.exports = router;