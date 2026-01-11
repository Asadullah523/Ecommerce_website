import mongoose from 'mongoose';

const cartItemSchema = mongoose.Schema({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String },
});

const cartSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true,
    },
    items: [cartItemSchema],
}, {
    timestamps: true,
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
