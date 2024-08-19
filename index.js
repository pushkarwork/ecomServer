const express = require("express")
const app = express()
const cors = require('cors');
var cookieParser = require('cookie-parser')
const dotenv = require("dotenv")
dotenv.config({ path: "backend/config/config.env" })
const productRoutes = require("./Routes/ProductRoutes")
const dbConnection = require("./config/database");
const UserRoutes = require("./Routes/UserRoutes")
const ErrorMiddleware = require("./Middlewares/Errors")
const orderRoutes = require("./Routes/orderRoutes")
const paymentRoutes = require("./Routes/paymentRoutes")
// process.on("uncaughtException", (err) => {
//     console.log(`Error is :${err}`)
//     console.log(`Shutting Down the Server due to Unhandled Rejection in index.js`)

//     process.exit(1)
// })

const corsOptions = {
    origin: 'http://localhost:5173', // Exact match for your frontend's origin
    credentials: true, // Ensure this is set to true
    optionsSuccessStatus: 200, // For older browsers compatibility
};


// console.log(object)
dbConnection()
// app.use(cors());
app.use(express.json({ limit: "10mb", verify: (req, res, buf) => { req.rawBody = buf.toString() } }))
app.use(cookieParser())

app.use(cors(corsOptions));
// Handle preflight requests for all routes
app.options('*', cors(corsOptions));
// app.options('*', cors(corsOptions));

app.use("/api/v1", productRoutes)
app.use("/api/v1", UserRoutes)
app.use("/api/v1", orderRoutes)
app.use("/api/v1", paymentRoutes)

app.use(ErrorMiddleware)
// const port = 4000
const server = app.listen(process.env.PORT, () => {
    console.log(`server runninng on ${process.env.PORT} and in ${process.env.NODE_ENV} mode`)
})

process.on('unhandledRejection', (err) => {
    console.log(`Error is :${err}`)
    console.log(`Shutting Down the Server due to Unhandled Rejection in index.js`)
    server.close(() => {
        process.exit(1)
    })
})


