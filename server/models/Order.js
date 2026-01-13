import mongoose from 'mongoose';

const orderItemSchema = mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: false },
    images: { type: Array, required: false },
    id: { type: String, required: false }, // Made optional for legacy items
});

const orderSchema = mongoose.Schema({
    orderId: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User',
    },
    customer: {
        name: { type: String, required: false },
        email: { type: String, required: false },
        address: { type: String, required: false },
        city: { type: String, required: false },
        zip: { type: String, required: false },
    },
    customerName: {
        type: String,
        required: false, // Made optional for legacy support
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
