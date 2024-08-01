const express = require("express")
const app = express()
const dotenv = require("dotenv")
dotenv.config({ path: "backend/config/config.env" })
const productRoutes = require("./Routes/ProductRoutes")
const dbConnection = require("./config/database");
const UserRoutes = require("./Routes/UserRoutes")
const ErrorMiddleware = require("./Middlewares/Errors")
// process.on("uncaughtException", (err) => {
//     console.log(`Error is :${err}`)
//     console.log(`Shutting Down the Server due to Unhandled Rejection in index.js`)

//     process.exit(1)
// })

// console.log(object)
dbConnection()
app.use(express.json())
app.use("/api/v1", productRoutes)
app.use("/api/v1", UserRoutes)

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


