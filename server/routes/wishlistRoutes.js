import express from 'express';
import Wishlist from '../models/Wishlist.js';

const router = express.Router();

// @desc    Get logged in user wishlist
// @route   GET /api/wishlist/:userId
router.get('/:userId', async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ userId: req.params.userId }).populate('products');
        if (wishlist) {
            res.json(wishlist);
        } else {
            res.json({ products: [] });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update wishlist
// @route   POST /api/wishlist
router.post('/', async (req, res) => {
    const { userId, products } = req.body;
    try {
        const wishlist = await Wishlist.findOneAndUpdate(
            { userId },
            { products },
            { upsert: true, new: true }
        );
        res.json(wishlist);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
