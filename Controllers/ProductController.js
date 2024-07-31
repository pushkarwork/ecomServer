const productSchema = require("../Models/productModel")


//Get all products = /api/v1/getALlProducts 
const getAllProducts = async (req, res) => {
    try {
        const products = await productSchema.find()
        res.status(201).json(products);

    } catch (error) {
        res.status(500).json({ message: "Error recieving products", error });
    }
}


//create new product = /api/v1/admin/newProduct
const createProduct = async (req, res) => {
    try {
        const product = await productSchema.create(req.body)
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: "Error creating product", error });
    }
};


// Get single product by ID = /api/v1/product/:id
const getSingleProduct = async (req, res) => {
    try {
        const product = await productSchema.findById(req?.params?.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving product", error });
    }
};


// Update single product by ID = /api/v1/product/:id
const updateProduct = async (req, res) => {
    try {
        let product = await productSchema.findById(req?.params?.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product = await productSchema.findByIdAndUpdate(req?.params?.id, req.body, { new: true })

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving product", error });
    }
};

// Delete single product  = /api/v1/product/:id
const deleteProduct = async (req, res) => {
    try {
        let product = await productSchema.findById(req?.params?.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        await product.deleteOne()
        res.status(200).json({ message: "Product Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving product", error });
    }
};


module.exports = { getAllProducts, createProduct, getSingleProduct, updateProduct ,deleteProduct};