import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (or Private with auth)
router.post('/', async (req, res) => {
    const { items, total, customer, customerName, user, paymentMethod, transactionId } = req.body;

    if (items && items.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    } else {
        try {
            // Generate a random 8-digit numeric orderId
            const orderId = Math.floor(10000000 + Math.random() * 90000000).toString();

            const order = new Order({
                orderId,
                items,
                user,
                customer,
                customerName,
                total,
                paymentMethod,
                transactionId,
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
        console.log('📦 Starting order fetch...');
        console.log('📦 MongoDB connection state:', req.app.locals.mongoose?.connection?.readyState);

        // Try to count first to see if collection is accessible
        const count = await Order.countDocuments();
        console.log(`📊 Order collection has ${count} documents`);

        console.log('📦 Executing find query...');
        // REMOVED .sort() to avoid "Sort exceeded memory limit" error
        // Frontend handles sorting anyway (VendorDashboard.jsx line 716-724)
        const orders = await Order.find({}).lean();
        console.log(`✅ Successfully fetched ${orders.length} orders`);

        res.json(orders);
    } catch (error) {
        console.error('❌ FATAL ERROR in orders GET route:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

        res.status(500).json({
            message: 'Failed to fetch orders',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        // Search by MongoDB _id first if it looks like one, then fallback to numeric orderId
        let order;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            order = await Order.findById(id);
        }

        if (!order) {
            order = await Order.findOne({ orderId: id });
        }

        if (order) {
            if (req.body.status) order.status = req.body.status;
            if (req.body.isPaid !== undefined) order.isPaid = req.body.isPaid;

            // Backfill numeric orderId if it's an old order
            if (!order.orderId) {
                order.orderId = Math.floor(10000000 + Math.random() * 90000000).toString();
            }

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
        const { id } = req.params;
        let order;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            order = await Order.findById(id);
        }

        if (!order) {
            order = await Order.findOne({ orderId: id });
        }

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
