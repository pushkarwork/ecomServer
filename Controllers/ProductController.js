const CatchAsyncErrors = require("../Middlewares/CatchAsyncErrors");
const productSchema = require("../Models/productModel");
const ApiFilters = require("../Utils/ApiFilters");
const ErrorHandler = require("../Utils/ErrorHandler")


//Get all products = /api/v1/getALlProducts 
const getAllProducts = CatchAsyncErrors(async (req, res) => {
    const resPerPage = 4;
    const api_filters = new ApiFilters(productSchema, req.query).search().filters()

    let products = await api_filters.query
    let filtered_Products_Count = products.length
    api_filters.pagination(resPerPage)
    products = await api_filters.query.clone()
    // const products = await productSchema.find()
    res.status(201).json({ resPerPage, filtered_Products_Count, products });
})


//create new product = /api/v1/admin/newProduct
const createProduct = CatchAsyncErrors(async (req, res) => {

    const product = await productSchema.create(req.body)
    res.status(201).json(product);

});


// Get single product by ID = /api/v1/product/:id
const getSingleProduct = CatchAsyncErrors(async (req, res, next) => {

    const product = await productSchema.findById(req?.params?.id);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404))
    }
    res.status(200).json(product);

});


// Update single product by ID = /api/v1/product/:id
const updateProduct = CatchAsyncErrors(async (req, res) => {
    let product = await productSchema.findById(req?.params?.id);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }
    product = await productSchema.findByIdAndUpdate(req?.params?.id, req.body, { new: true })
    res.status(200).json(product);

});

// Delete single product  = /api/v1/product/:id
const deleteProduct = CatchAsyncErrors(async (req, res) => {
    let product = await productSchema.findById(req?.params?.id);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }
    await product.deleteOne()
    res.status(200).json({ message: "Product Deleted Successfully" });
});


module.exports = { getAllProducts, createProduct, getSingleProduct, updateProduct, deleteProduct };