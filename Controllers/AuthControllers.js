const CatchAsyncErrors = require("../Middlewares/CatchAsyncErrors");
const UserModels = require("../Models/UserModels");
const ErrorHandler = require("../Utils/ErrorHandler");
const sendToken = require("../Utils/sendToken");

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
    const token = user.generateJwtToken();

    // Send token as a response (you can also set it as a cookie)
    res.status(200).json({
        success: true,
        token
    });
});



module.exports = { createUser, loginUser }