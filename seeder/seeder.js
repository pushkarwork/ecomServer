
const { default: mongoose } = require("mongoose")
const products = require("./data")
const productSchema = require("../Models/productModel")


const seedData = async () => {
    try {
        await mongoose.connect("mongodb+srv://lefini1037:pushkar@cluster0.vy8pzci.mongodb.net/SHOPiT?retryWrites=true&w=majority&appName=Cluster0")

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