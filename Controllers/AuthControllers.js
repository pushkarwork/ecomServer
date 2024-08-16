const { upload_file, delete_file } = require("../Utils/clooudinary");

const CatchAsyncErrors = require("../Middlewares/CatchAsyncErrors");
const UserModels = require("../Models/UserModels");
const getReset_Password_Template = require("../Utils/EmailTemplate");
const ErrorHandler = require("../Utils/ErrorHandler");
const sendToken = require("../Utils/sendToken");
const sendEmail = require("../Utils/SendEmail");
const crypto = require("crypto");

const createUser = CatchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body

    const user = await UserModels.create({
        name, email, password
    })
    sendToken(user, 201, res)
})

//Login User
const loginUser = CatchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        // return res.status(400).json({ message: 'Please provide email and password' })
        return next(new ErrorHandler("Please provide email and password", 400))
    }

    // Find user by email and select the password field
    const user = await UserModels.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorHandler("Please enter correct email or password", 401))
    }

    // Check if the password is correct
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Please enter correct email or password", 401))
    }

    // Generate token
    // const token = user.generateJwtToken();

    // Send token as a response (you can also set it as a cookie)
    // res.status(200).json({
    //     success: true,
    //     token
    // });
    sendToken(user, 200, res)
});


const logOut = CatchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({ message: "Logged Out successfully" })
})

const forgetPassword = CatchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;
    const user = await UserModels.findOne({ email });

    if (!user) {
        return next(new ErrorHandler("User not found with this Email", 404))
    }

    const reset_token = user.getResetPasswordToken()
    await user.save()

    const Reset_Url = `${process.env.FRONTEND_URL}/api/v1/password/reset/${reset_token}`
    const message = getReset_Password_Template(user?.name, Reset_Url)

    try {
        await sendEmail({
            email: user.email,
            subject: "SHOPiT Password Recovery",
            message
        })
        res.status(200).json({ message: `Email sent to ${user.name} having Email : ${user.email}` })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.save();
        return next(new ErrorHandler(error?.message, 500))

    }
    // // Check if the password is correct
    // const isPasswordMatched = await user.comparePassword(password);

    // if (!isPasswordMatched) {
    //     return next(new ErrorHandler("Please enter correct email or password", 401))
    // }

    // sendToken(user, 200, res)
});


const ResetPassword = CatchAsyncErrors(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    // console.log(resetPassword_Token)

    const user = await UserModels.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } })
    // console.log(user)
    if (!user) {
        return next(new ErrorHandler("Reset Password token is invalid or has been Expired!", 400))
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match", 400))
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendToken(user, 200, res)
});

//geT Logged IN User Profile --- api/v1/me

const getUserProfile = CatchAsyncErrors(async (req, res, next) => {

    const user = await UserModels.findById(req?.user?._id);
    res.status(200).json({ user });

})

//update LoggedIN user password --- api/v1/password/update

const updatePassword = CatchAsyncErrors(async (req, res, next) => {

    const user = await UserModels.findById(req?.user?._id).select("+password");
    const Is_Matched_Password = await user.comparePassword(req.body.oldPassword)
    console.log("here",Is_Matched_Password)

    if (!Is_Matched_Password) {
        return next(new ErrorHandler("You have entered the wrong password , please check again", 400))
    }

    user.password = req.body.Password;

    await user.save()

    res.status(200).json({ success: true });

})

//update LoggedIN user Profile(name or email) --- api/v1/me/update

const updateProfile = CatchAsyncErrors(async (req, res, next) => {
    const updated_Data = { name: req.body.name, email: req.body.email }

    const user = await UserModels.findByIdAndUpdate(req?.user?._id, updated_Data, { new: true });

    res.status(200).json({ user });

})

//get all users ---api/v1/admin/users
const allUsers = CatchAsyncErrors(async (req, res, next) => {
    const users = await UserModels.find();

    res.status(200).json({ users })
})

//update user profile ---api/v1/admin/getUser/:id
const getUserDetail = CatchAsyncErrors(async (req, res, next) => {
    const user = await UserModels.findById(req.params.id)

    if (!user) {
        return next(new ErrorHandler("User not Found", 404))
    }

    res.status(200).json({ user })


})


//update user Profile(name or email or ROLE) --- api/v1/admin/updateuser

const updateUser = CatchAsyncErrors(async (req, res, next) => {
    const updated_Data = { name: req.body.name, email: req.body.email, role: req.body.role }

    const user = await UserModels.findByIdAndUpdate(req.params.id, updated_Data, { new: true });

    res.status(200).json({ user });

})

//delete user Profile --- api/v1/admin/delete

const deleteUser = CatchAsyncErrors(async (req, res, next) => {


    const user = await UserModels.findById(req.params.id);
    if (!user) {
        return next(new ErrorHandler("User not Found", 404))
    }

    await user.deleteOne()

    res.status(200).json({ success: true });

})

// Upload user avatar => /api/v1/me/upload_avatar
const uplaodAvatar = CatchAsyncErrors(async (req, res, next) => {
    const avatarResponse = await upload_file(req.body.avatar, "Home/shopit/avatar");
    console.log("this is hi")

    if (req.user.avatar.url) {
        console.log("this is avaat", req.user.avatar.url)
        await delete_file(req.user.avatar.public_id)
    }

    const user = await UserModels.findByIdAndUpdate(req?.user?._id, {
        avatar: avatarResponse,
    });
    res.status(200).json({
        user,
    });
});



module.exports = { createUser, loginUser, logOut, forgetPassword, ResetPassword, uplaodAvatar, getUserProfile, updatePassword, updateProfile, allUsers, getUserDetail, updateUser, deleteUser }