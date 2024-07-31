const productSchema = require("../Models/productModel")

const getAllProducts = async (req, res) => {
    res.send({ message: "HEllo from here" })
}

module.exports = { getAllProducts }