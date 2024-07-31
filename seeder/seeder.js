
const { default: mongoose } = require("mongoose")
const products = require("./data")
const productSchema = require("../Models/productModel")


const seedData = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/SHOPiT")

        await productSchema.deleteMany()
        console.log(`products deleted`)

        await productSchema.insertMany(products)
        console.log(`products added in db`)
        process.exit()

    } catch (error) {
        console.log(error)
        process.exit()
    }

}

seedData()