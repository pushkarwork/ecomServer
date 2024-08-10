const CatchAsyncErrors = require("../Middlewares/CatchAsyncErrors");
const productSchema = require("../Models/productModel");
const ApiFilters = require("../Utils/ApiFilters");
const ErrorHandler = require("../Utils/ErrorHandler")


//Get all products = /api/v1/getALlProducts 
const getAllProducts = CatchAsyncErrors(async (req, res, next) => {
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
    req.body.user = req.user._id

    const product = await productSchema.create(req.body)
    res.status(201).json(product);

});


// Get single product by ID = /api/v1/product/:id
const getSingleProduct = CatchAsyncErrors(async (req, res, next) => {

    const product = await productSchema.findById(req?.params?.id);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404))
    }
    res.status(200).json({product});

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

//create new product Review = /api/v1/review
const createReview = CatchAsyncErrors(async (req, res) => {
    const { rating, comment, productId } = req.body

    const review = {
        rating: Number(rating),
        comment,
        user: req.user._id
    }

    const product = await productSchema.findById(productId)

    if (!product) {
        return next(new ErrorHandler("product not found with this id ", 404))
    }

    const isReviewed = product?.reviews?.find((r) => r.user.toString() === req.user._id)

    if (isReviewed) {
        product.reviews.forEach(review => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment;
                review.rating = rating;
            }
        });
    } else {
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }

    product.ratings = product.reviews.reduce((acc, i) => i.rating + acc, 0) / product.reviews.length

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true
    })

});

//Get all Reviews of a Product = /api/v1/allReviews

const GetReviews = CatchAsyncErrors(async (req, res, next) => {

    const product = await productSchema.findById(req.query.id)

    if (!product) {
        return next(new ErrorHandler("Product not Found", 404))
    }

    const allReviews = product.reviews

    res.status(200).json({
        allReviews  // Agar frontend pe sahi se reviews na aaye to haya ya fr allReviews pe check  krna hia knki video mei object bana k bheja hai
    })
})

//Delete a product Review = /api/v1/admin/Delete review
const DeleteReview = CatchAsyncErrors(async (req, res) => {

    let product = await productSchema.findById(req.query.productId)

    if (!product) {
        return next(new ErrorHandler("product not found with this id ", 404))
    }

    const reviews = product?.reviews?.filter((review) => review._id.toString() !== req.query.id.toString())


    const numOfReviews = reviews.length;


    const ratings = numOfReviews === 0 ? 0 : reviews.reduce((acc, i) => i.rating + acc, 0) / numOfReviews


    product = await productSchema.findByIdAndUpdate(req.query.productId, { reviews, numOfReviews, ratings }, { new: true })
    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true
    })

});

module.exports = { getAllProducts, createProduct, getSingleProduct, updateProduct, deleteProduct, createReview, GetReviews, DeleteReview };