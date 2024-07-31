const express = require("express")
const app = express()
const dotenv = require("dotenv")
dotenv.config({ path: "backend/config/config.env" })
const productRoutes = require("./Routes/ProductRoutes")
const dbConnection = require("./config/database");




dbConnection()
app.use(express.json())
app.use("/api/v1", productRoutes)


// const port = 4000
app.listen(process.env.PORT, () => {
    console.log(`server runninng on ${process.env.PORT} and in ${process.env.NODE_ENV} mode`)
})