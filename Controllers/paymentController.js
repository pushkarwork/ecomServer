const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const CatchAsyncErrors = require("../Middlewares/CatchAsyncErrors");
const Order = require("../Models/OrderModel");


const stripeCheckoutSession = CatchAsyncErrors(async (req, res, next) => {
    const body = req.body
    const shippingInfo = body.shippingInfo;
    const shipping_rate = body.itemsPrice >= 200 ? "shr_1PpDTMP51tOIoWAdPJGwK565" : "shr_1PpDTtP51tOIoWAd6qq2CQeZ"
    const line_items = body.orderItems.map((item) => {
        return {
            price_data: {
                currency: "AUD",
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : [],
                    metadata: { productId: item.product }
                },
                unit_amount: item.price * 100
            },
            tax_rates: ["txr_1PpDcsP51tOIoWAdwaVOLr42"],
            quantity: item.quantity
        }
    })
    // Await the session creation
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/me/orders`,
        cancel_url: `${process.env.FRONTEND_URL}`,
        customer_email: req.user.email,
        client_reference_id: req.user._id.toString(),
        metadata: { ...shippingInfo, itemsPrice: body.itemsPrice },
        shipping_options: [
            { shipping_rate },
        ],
        line_items,
    });
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
    // console.log("session is ", session)
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")

    res.status(200).json({
        url: session.url,
    });
});


const getOrderItems = async (line_items) => {
    return new Promise((resolve, reject) => {
        let cartItems = [];
        line_items?.data?.forEach(async (item) => {
            const product = await stripe.products.retrieve(item.price.product);
            const productId = product.metadata.productId;

            console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
            console.log("items is =>", item)
            console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
            console.log("product is =>", product)
            cartItems.push({
                product: productId,
                name: product.name,
                price: item.price.unit_amount_decimal / 100,
                quantity: item.quantity,
                image: product.images[0],
            });
            if (cartItems.length === line_items?.data?.length) {
                resolve(cartItems);
            }

        });
    });
}
const stripeWebHook = CatchAsyncErrors(async (req, res, next) => {
    try {
        console.log("hi there from stripeWweb hook")
        const signature = req.headers['stripe-signature'];
        const event = stripe.webhooks.constructEvent(
            req.rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET
        )

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const line_items = await stripe.checkout.sessions.listLineItems(session.id)

            const orderItems = await getOrderItems(line_items)
            const user = session.client_reference_id;
            const totalAmount = session.amount_total / 100;
            const taxAmount = session.total_details.amount_tax / 100;
            const shippingAmount = session.total_details.amount_shipping / 100;
            const itemsPrice = session.metadata.itemsPrice;
            const shippingInfo = {
                address: session.metadata.address,
                city: session.metadata.city,
                phone: session.metadata.phone,
                pinCode: session.metadata.pinCode,
                country: session.metadata.country,
            };

            const paymentInfo = {
                id: session.payment_intent,
                status: session.payment_status
            }

            const orderData = {
                shippingInfo,
                orderItems, itemsPrice, taxAmount, shippingAmount, totalAmount, paymentInfo, paymentMethod: "CARD", user
            }
            await Order.create(orderData)

            res.status(200).json({ success: true })
        }
    } catch (error) {
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
        console.log("error is ", error)
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
    }
})

module.exports = { stripeCheckoutSession, stripeWebHook };