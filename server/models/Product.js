import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema({
    userName: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    date: { type: String, default: new Date().toISOString().split('T')[0] },
    verified: { type: Boolean, default: false },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User',
    },
}, {
    timestamps: true,
});

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    originalPrice: {
        type: Number,
        required: false,
    },
    categories: [{
        type: String,
        required: true,
    }],
    images: [{
        type: String,
        required: true,
    }],
    rating: {
        type: Number,
        required: true,
        default: 0,
    },
    reviewCount: {
        type: Number,
        required: true,
        default: 0,
    },
    reviews: [reviewSchema],
    provider: {
        type: String,
        required: true,
        default: 'Neon Tech Official',
    },
    shipping: {
        type: String,
        required: false,
        default: 'Neon Direct',
    },
    description: {
        type: String,
        required: true,
    },
    inStock: {
        type: Boolean,
        required: true,
        default: true,
    },
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

export default Product;
