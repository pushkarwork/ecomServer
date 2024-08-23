const CatchAsyncErrors = require("../Middlewares/CatchAsyncErrors");
const productSchema = require("../Models/productModel");
const ApiFilters = require("../Utils/ApiFilters");
const ErrorHandler = require("../Utils/ErrorHandler")
const Order = require("../Models/OrderModel")
const { upload_file, delete_file } = require('../Utils/clooudinary');

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

    const product = await productSchema.findById(req?.params?.id).populate("reviews.user");
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404))
    }
    res.status(200).json({ product });

});



// Get ADMIN products  = /api/v1/admin/products
const getAdminProducts = CatchAsyncErrors(async (req, res, next) => {

    const products = await productSchema.find();

    res.status(200).json({ products });

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

    for (let i = 0; i < product.images.length; i++) {
        await delete_file(product?.images[i].public_id)
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

    const isReviewed = product?.reviews?.find((r) => r.user.toString() === req.user._id.toString())

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

//can  user review= /api/v1/can_review
const canUserReview = CatchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find({
        user: req.user._id,
        "orderItems.product": req.query.productId
    })

    if (orders.length === 0) {
        return res.status(200).json({ canReview: false })
    }

    res.status(200).json({ canReview: true })
})




//Upload product images => api / vi / admin / products / id / upload_images
const uploadProductImages = CatchAsyncErrors(async (req, res) => {

    let product = await productSchema.findById(req?.params?.id);
    // console.log("images are", req.body.images)
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404))
    }
    const uploader = async (image) => {
        // console.log("Uploading image:", image);
        return upload_file(image, "shopit/products");
    };
    // console.log("uploader is=>", uploader)
    const urls = await Promise.all((req?.body?.images).map(uploader));
    // console.log("Product is=>", urls)

    product?.images.push(...urls)
    await product?.save();
    res.status(200).json({
        product
    })


})

//Delete product images => api / vi / admin / products / id / delete_image
const DeleteProductImage = CatchAsyncErrors(async (req, res) => {
    let product = await productSchema.findById(req?.params?.id);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    const isDeleted = await delete_file(req.body.imgId);
    if (isDeleted) {
        product.images = product.images.filter((img) => img.public_id !== req.body.imgId);
        await product.save();
    }

    res.status(200).json({
        product
    });
});

module.exports = { DeleteProductImage, uploadProductImages, getAllProducts, getAdminProducts, createProduct, canUserReview, getSingleProduct, updateProduct, deleteProduct, createReview, GetReviews, DeleteReview };