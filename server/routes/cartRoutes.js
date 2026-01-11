import express from 'express';
import Cart from '../models/Cart.js';

const router = express.Router();

// @desc    Get logged in user cart
// @route   GET /api/cart/:userId
router.get('/:userId', async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId });
        if (cart) {
            res.json(cart);
        } else {
            res.json({ items: [] });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update cart
// @route   POST /api/cart
router.post('/', async (req, res) => {
    const { userId, items } = req.body;
    try {
        const cart = await Cart.findOneAndUpdate(
            { userId },
            { items },
            { upsert: true, new: true }
        );
        res.json(cart);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
