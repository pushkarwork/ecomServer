const CatchAsyncErrors = require("../Middlewares/CatchAsyncErrors");
const ErrorHandler = require("../Utils/ErrorHandler");
const Order = require("../Models/OrderModel");
const Product = require("../Models/productModel");

const newOrder = CatchAsyncErrors(async (req, res, next) => {
    const { shippingInfo, orderItems, paymentMethod, paymentInfo, itemsPrice, taxAmount, shippingAmount, totalAmount, orderStatus } = req.body;

    const order = await Order.create({
        shippingInfo, orderItems, paymentMethod, paymentInfo, itemsPrice, taxAmount, shippingAmount, totalAmount, orderStatus, user: req.user._id
    });


    res.status(200).json({ order })
})

//get single order  --- api/v1/order/:id
const singleOrder = CatchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate("user", "name email")

    if (!order) {
        return next(new ErrorHandler("Order Not found", 404))
    }

    res.status(201).json({ order })
})


//get logged in users orders --- api/v1/myorders

const myOrders = CatchAsyncErrors(async (req, res, next) => {
    const myorder = await Order.find({ user: req.user._id })

    if (!myorder) {
        return next(new ErrorHandler("Order Not found for this user", 404))
    }

    res.status(201).json({ myorder })
})

//get all Orders --- api/v1/admin/allorders

const allOrders = CatchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find().populate("user", "name email");

    res.status(200).json({ orders });
})


//update Order status ---api/v1/admin/order/:id

const updateOrder = CatchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order Not found !", 404))
    }

    if (order?.orderStatus === "delivered") {
        return next(new ErrorHandler("Order has already been delivered", 400));

    }
    // Update products stock
    order?.orderItems?.forEach(async (item) => {
        const product = await Product.findById(item?.product?.toString()); //id of the item in ordered Item list
        if (!product) {
            return next(new ErrorHandler("No Product found with this ID", 404));
        }
        product.stock = product.stock - item.quantity;
        await product.save({ validateBeforeSave: false });
    });
    order.orderStatus = req.body.status;
    order.deliveredAt = Date.now();


    await order.save()
    res.status(200).json({
        success: true
    })

})


//Delete order  --- api/v1/order/:id
const DeleteOrder = CatchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order Not found", 404))
    }

    await Order.deleteOne()

    res.status(201).json({ success: true })
})



module.exports = { newOrder, singleOrder, myOrders, allOrders, updateOrder, DeleteOrder }


