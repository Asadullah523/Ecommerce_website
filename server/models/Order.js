import mongoose from 'mongoose';

const orderItemSchema = mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: false },
    images: { type: Array, required: false },
    id: { type: String, required: true }, // Store external ID if needed
});

const orderSchema = mongoose.Schema({
    orderId: {
        type: String,
        required: false,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: false, // Optional for guest checkouts
        ref: 'User',
    },
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        zip: { type: String, required: true },
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
