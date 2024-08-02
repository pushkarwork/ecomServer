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
    const resetPasswordToken =  crypto.createHash('sha256').update(req.params.token).digest('hex');
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



module.exports = { createUser, loginUser, logOut, forgetPassword, ResetPassword }