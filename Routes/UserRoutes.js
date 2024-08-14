const express = require('express');
const { createUser, loginUser, logOut, forgetPassword, ResetPassword, getUserProfile, updatePassword, updateProfile, allUsers, getUserDetail, updateUser, deleteUser, uplaodAvatar } = require('../Controllers/AuthControllers');
const { isAuthenticated_User, Authorize_Roles } = require('../Middlewares/AuthMiddleware');
const router = express.Router();


router.route("/user/new").post(createUser)
router.route("/user/login").post(loginUser)
router.route("/user/logout").get(logOut)
router.route("/user/password/forgot").post(forgetPassword)
router.route("/password/reset/:token").put(ResetPassword)
router.route("/me").get(isAuthenticated_User, getUserProfile)
//upload avatar
router.route("/me/upload_avatar").put(isAuthenticated_User, uplaodAvatar)
router.route("/password/update").put(isAuthenticated_User, updatePassword)
router.route("/me/update").put(isAuthenticated_User, updateProfile)
router.route("/admin/users").get(isAuthenticated_User, Authorize_Roles("admin"), allUsers)
router.route("/admin/user/:id").get(isAuthenticated_User, Authorize_Roles("admin"), getUserDetail)
router.route("/admin/updateuser/:id").put(isAuthenticated_User, Authorize_Roles("admin"), updateUser)
router.route("/admin/delete/:id").delete(isAuthenticated_User, Authorize_Roles("admin"), deleteUser)



module.exports = router;