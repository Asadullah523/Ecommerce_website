import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (or Private with auth)
router.post('/', async (req, res) => {
    const { items, total, customerName, user } = req.body;

    if (items && items.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    } else {
        try {
            const order = new Order({
                items,
                user,
                customerName,
                total,
            });

            const createdOrder = await order.save();
            res.status(201).json(createdOrder);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = req.body.status || order.status;
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            await order.deleteOne();
            res.json({ message: 'Order removed' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Clear all cancelled orders
// @route   DELETE /api/orders/status/cancelled
// @access  Private/Admin
router.delete('/status/cancelled', async (req, res) => {
    try {
        await Order.deleteMany({ status: { $regex: /^cancelled/ } });
        res.json({ message: 'Cancelled orders cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
