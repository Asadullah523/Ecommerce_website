import mongoose from 'mongoose';

const orderItemSchema = mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    id: { type: String, required: true }, // Store external ID if needed
});

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: false, // Optional for guest checkouts
        ref: 'User',
    },
    customerName: {
        type: String,
        required: true,
    },
    items: [orderItemSchema],
    total: {
        type: Number,
        required: true,
        default: 0.0,
    },
    status: {
        type: String,
        required: true,
        default: 'pending',
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'cancelled_by_customer'],
    },
    date: {
        type: String,
        required: true,
        default: new Date().toISOString().split('T')[0],
    },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
