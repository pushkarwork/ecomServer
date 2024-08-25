const mongoose = require("mongoose");
const dotenv = require("dotenv");

const dotenvResult = dotenv.config({ path: "config/config.env" });
// console.log("here in db",process.env.CLOUDINARY_CLOUD_NAME)


if (dotenvResult.error) {
    throw dotenvResult.error;
}

let DB_URI = process.env.MAIN_URi;


const dbConnection = () => {
    mongoose.connect(DB_URI)
        .then(() => {
            console.log("Connected to DB");
        })
        .catch((error) => {
            console.error("Database connection error:", error);
            process.exit(1);
        });
};

module.exports = dbConnection;
