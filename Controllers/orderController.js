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



async function getSalesData(startDate, endDate) {
    const salesData = await Order.aggregate([
        {
            // Stage 1 - Filter results
            $match: {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                },
            }
        },
        {
            // Stage 2 - Group by date and calculate totals
            $group: {
                _id: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                },
                totalSales: { $sum: "$totalAmount" },
                numOrders: { $sum: 1 },
            }
        }
    ]);

    const salesMap = new Map();
    let totalSales = 0;
    let totalNumOrders = 0;

    salesData.forEach((entry) => {
        const date = entry._id.date;
        const sales = entry.totalSales;
        const numOrders = entry.numOrders;

        // Only add to the map if the date isn't already present
        if (!salesMap.has(date)) {
            salesMap.set(date, { sales, numOrders });
            totalSales += sales;
            totalNumOrders += numOrders;
        }
    });

    const datesBetween = getDatesBetween(startDate, endDate);

    // Create final sales data array with 0 for dates without sales
    const finalSalesData = datesBetween.map((date) => ({
        date,
        sales: (salesMap.get(date) || { sales: 0 }).sales,
        numOrders: (salesMap.get(date) || { numOrders: 0 }).numOrders,
    }));

    return { salesData: finalSalesData, totalSales, totalNumOrders }
}


//generate an array of dates between start and end date

function getDatesBetween(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= new Date(endDate)) {
        const formattedDate = currentDate.toISOString().split("T")[0];
        dates.push(formattedDate);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;

}


// Get Sales Data > /api/vl/admin/get_sales
const getSales = CatchAsyncErrors(async (req, res, next) => {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);

    const { salesData, totalSales, totalNumOrders } = await getSalesData(startDate, endDate)
    res.status(200).json({
        totalSales, totalNumOrders, sales: salesData
    })
});


module.exports = { newOrder, singleOrder, myOrders, allOrders, updateOrder, DeleteOrder, getSales }


