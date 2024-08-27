const UserModels = require("../Models/UserModels")
const ErrorHandler = require("../Utils/ErrorHandler")
const CatchAsyncErrors = require("./CatchAsyncErrors")
const jwt = require("jsonwebtoken")

const isAuthenticated_User = CatchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies
    console.log("here i am in middleware",token);
    if (!token) {
        return next(new ErrorHandler("Please login to access this resource", 401))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await UserModels.findById(decoded.id)
    next()
})


const Authorize_Roles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role ${req.user.role}  is not allowed to access this resource`, 403))
        }
        next();
    }
}

module.exports = { isAuthenticated_User, Authorize_Roles }
