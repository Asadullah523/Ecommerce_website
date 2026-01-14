import mongoose from 'mongoose';

const couponSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['percentage', 'fixed'],
        default: 'percentage',
    },
    active: {
        type: Boolean,
        required: true,
        default: true,
    },
    expiryDate: {
        type: Date,
        required: false,
    },
}, {
    timestamps: true,
});

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
