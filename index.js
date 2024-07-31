import express from "express";
const app = express()
import dotenv from "dotenv"
dotenv.config({path: "backend/config/config.env"})
import productRoutes from "./Routes/ProductRoutes.js"
import { dbConnection } from "./config/database.js";




dbConnection()
app.use("/api/v1", productRoutes)


// const port = 4000
app.listen(process.env.PORT, () => {
    console.log(`server runninng on ${process.env.PORT} and in ${process.env.NODE_ENV} mode`)
})