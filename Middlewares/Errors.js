// const { stack } = require("../Routes/ProductRoutes")
const dotenv = require("dotenv");
const ErrorHandler = require("../Utils/ErrorHandler");
dotenv.config({ path: "backend/config/config.env" })
module.exports = (err, req, res, next) => {
    let error = {
        statusCode: err?.statusCode || 500,
        message: err?.message || `Internal Server Error`
    }

    if (err.name === "CastError") {
        const message = `Resource not Found . Invalid ${err.path}`;
        error = new ErrorHandler(message, 404)
    }

    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map((value) => value.message)
        error = new ErrorHandler(message, 400)
    }

    if (process.env.NODE_ENV === "DEVELOPMENT") {
        res.status(error.statusCode).json({
            message: error.message,
            error: err,
            stack: err?.stack
        })
    }

    // console.log(process.env.NODE_ENV)/
    else {
        res.status(error.statusCode).json({
            message: error.message,
            error: err,
            stack: err?.stack
        })
    }

}