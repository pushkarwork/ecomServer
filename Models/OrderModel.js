const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    shippingInfo: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        pinCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [
        {
            name: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            image: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            }
        }
    ],
    paymentMethod: {
        type: String,
        enum: ['COD', 'CARD'],
        required: [true, "Please select payment method"]
    },
    paymentInfo: {
        id: {
            type: String
        },
        status: {
            type: String
        }
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    taxAmount: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingAmount: {
        type: Number,
        required: true,
        default: 0.0
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0.0
    },
    orderStatus: {
        type: String,
        enum: ['processing', 'shipped', 'delivered'],
        default: 'processing'
    },
    deliveredAt: {
        type: Date
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
