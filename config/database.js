const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: "backend/config/config.env" });

let DB_URI = process.env.DB_Local_URi;
const dbConnection = () => {
    if (process.env.NODE_ENV === "PRODUCTION") {
        DB_URI = process.env.MAIN_URi
    }
    else if (!DB_URI) {
        console.error("Database URI is not set. Please check your environment variables.");
        return;
    }

    mongoose.connect(DB_URI)
        .then(() => {
            console.log("Connected to DB");
        })
        .catch((error) => {
            console.error("Database connection error:", error);
            process.exit(1)
        });
};

module.exports = dbConnection