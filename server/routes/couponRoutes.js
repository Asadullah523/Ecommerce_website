import express from 'express';
import Coupon from '../models/Coupon.js';

const router = express.Router();

// @desc    Get all coupons
// @route   GET /api/coupons
router.get('/', async (req, res) => {
    try {
        const coupons = await Coupon.find({});
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a coupon
// @route   POST /api/coupons
router.post('/', async (req, res) => {
    const { code, discount, type, expiryDate } = req.body;
    try {
        const coupon = new Coupon({ code, discount, type, expiryDate });
        const createdCoupon = await coupon.save();
        res.status(201).json(createdCoupon);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
router.delete('/:id', async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (coupon) {
            await coupon.deleteOne();
            res.json({ message: 'Coupon removed' });
        } else {
            res.status(404).json({ message: 'Coupon not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
